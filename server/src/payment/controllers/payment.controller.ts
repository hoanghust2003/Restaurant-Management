import { Controller, Post, Body, Get, Query, Req, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../enums/user-role.enum';
import { PaymentService } from '../services/payment.service';
import { Request } from 'express';
import { PrintReceiptDto } from '../dto/print-receipt.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Body() body: { orderId: string; amount: number },
    @Req() req: Request
  ) {
    const ipAddr = req.ip || req.socket.remoteAddress || '';
    const paymentUrl = await this.paymentService.createVNPayUrl(
      body.orderId,
      body.amount,
      ipAddr
    );

    return { paymentUrl };
  }

  @Get('vnpay-return')
  async handleVNPayReturn(@Query() query: Record<string, string>) {
    return await this.paymentService.verifyVNPayReturn(query);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    return await this.paymentService.getPaymentByOrderId(orderId);
  }  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getPaymentHistory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return await this.paymentService.getPaymentHistory({
      startDate: start,
      endDate: end,
      status
    });
  }
  
  @Post('print-receipt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async recordReceiptPrint(@Body() printReceiptDto: PrintReceiptDto) {
    return this.paymentService.recordReceiptPrint(printReceiptDto);
  }
}
