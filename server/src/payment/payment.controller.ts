import { Controller, Post, Body, Req, Get, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { PrintReceiptDto } from './dto/print-receipt.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly ordersService: OrdersService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('create-payment')
  @ApiOperation({ summary: 'Create payment URL for an order' })
  @ApiResponse({ status: 200, description: 'Returns payment URL' })
  async createPayment(
    @Body() body: { orderId: string },
    @Req() req: any,
  ) {
    const order = await this.ordersService.findOne(body.orderId);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    const paymentUrl = this.vnpayService.createPaymentUrl(
      order.total_price,
      order.id,
      `Payment for order ${order.id}`,
      req.ip,
    );

    // Create initial payment record
    await this.paymentService.createPayment({
      orderId: order.id,
      amount: order.total_price,
      status: 'pending',
      paymentMethod: 'vnpay'
    });

    return { paymentUrl };
  }

  @Get('vnpay-return')
  @ApiOperation({ summary: 'Handle VNPay payment return' })
  @ApiResponse({ status: 200, description: 'Payment verification result' })
  async handleReturn(@Query() query: any) {
    const isValidSignature = this.vnpayService.verifyReturnUrl(query);
    
    if (!isValidSignature) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }

    const orderId = query['vnp_TxnRef'];
    const transactionId = query['vnp_TransactionNo'];
    const amount = Number(query['vnp_Amount']) / 100; // Convert from VND cents to VND

    if (query['vnp_ResponseCode'] === '00') {
      // Payment successful
      const order = await this.ordersService.findOne(orderId);
      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      // Update payment record
      await this.paymentService.updatePayment(orderId, {
        status: 'completed',
        transactionId,
        paidAt: new Date(),
        paymentMethod: 'vnpay'
      });

      // Move order to completed status if not already completed
      if (order.status !== OrderStatus.COMPLETED) {
        await this.ordersService.updateStatus(orderId, OrderStatus.COMPLETED);
      }
      
      return {
        status: 'success',
        message: 'Payment successful',
        orderId,
        amount,
        transactionId
      };
    }

    // Update payment record for failed payment
    await this.paymentService.updatePayment(orderId, {
      status: 'failed',
      transactionId,
      paymentMethod: 'vnpay'
    });

    return {
      status: 'error',
      message: 'Payment failed',
      responseCode: query['vnp_ResponseCode'],
      orderId
    };
  }
  @Post('print-receipt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async recordReceiptPrint(@Body() printReceiptDto: PrintReceiptDto) {
    return this.paymentService.recordReceiptPrint(printReceiptDto);
  }
}
