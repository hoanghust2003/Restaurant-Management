import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { OrderItemStatus } from '../enums/order-item-status.enum';

@WebSocketGateway({
  cors: true,
  transports: ['websocket', 'polling']
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private kitchenSockets: Map<string, Socket> = new Map();
  private customerSockets: Map<string, Socket> = new Map();

  constructor(@Inject(forwardRef(() => OrdersService)) private readonly ordersService: OrdersService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.kitchenSockets.delete(client.id);
    this.customerSockets.delete(client.id);
  }

  @SubscribeMessage('kitchen:join')
  handleKitchenJoin(client: Socket) {
    this.kitchenSockets.set(client.id, client);
    console.log(`Kitchen client joined: ${client.id}`);
  }

  @SubscribeMessage('customer:join')
  handleCustomerJoin(client: Socket, payload: { userId: string }) {
    this.customerSockets.set(payload.userId, client);
    console.log(`Customer joined: ${payload.userId}`);
  }

  // Broadcast new order to kitchen
  notifyNewOrder(order: any) {
    this.kitchenSockets.forEach(socket => {
      socket.emit('order:new', order);
    });
  }

  // Notify customer about order status change
  notifyOrderStatusChange(order: any) {
    const customerSocket = this.customerSockets.get(order.userId);
    if (customerSocket) {
      customerSocket.emit('order:status_update', {
        orderId: order.id,
        status: order.status,
        items: order.items
      });
    }
  }

  // Notify customer about item status change
  async notifyOrderItemStatusChange(orderId: string, payload: { itemId: number, status: string }) {
    const order = await this.ordersService.findOne(orderId);
    
    if (!order) {
      console.error(`Order ${orderId} not found`);
      return;
    }

    const status = payload.status as OrderItemStatus;

    this.server.emit('orderItemStatusChanged', {
      orderId,
      itemId: payload.itemId,
      status,
      order
    });
  }

  @SubscribeMessage('order:create')
  handleOrderCreate(client: Socket, payload: any) {
    // Notify kitchen about new order
    this.notifyNewOrder(payload);
  }
  @SubscribeMessage('kitchen:update_item')
  handleKitchenUpdateItem(client: Socket, payload: { orderId: string; itemId: string; status: string }) {
    // Notify customer about item status update
    this.notifyOrderItemStatusChange(payload.orderId, {
      itemId: Number(payload.itemId),
      status: payload.status
    });
  }

  @SubscribeMessage('kitchen:update_order')
  handleKitchenUpdateOrder(client: Socket, payload: { orderId: string; status: string }) {
    // Notify customer about order status update
    this.notifyOrderStatusChange({
      id: payload.orderId,
      status: payload.status
    });
  }

  @SubscribeMessage('customer:request_status')
  handleCustomerStatusRequest(client: Socket, payload: { orderId: string }) {
    // Here you would fetch the order status from the database
    // and emit it back to the customer
    const kitchenSocket = Array.from(this.kitchenSockets.values())[0];
    if (kitchenSocket) {
      kitchenSocket.emit('kitchen:status_request', payload);
    }
  }
}
