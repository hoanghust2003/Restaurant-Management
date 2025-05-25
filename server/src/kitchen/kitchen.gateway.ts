import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { OrderStatus, OrderItemStatus } from '../enums/order-status.enum';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
})
// Không áp dụng JwtAuthGuard toàn cục, thay vào đó áp dụng cho từng SubscribeMessage cụ thể khi cần
export class KitchenGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private kitchenClients: Set<Socket> = new Set();
  async handleConnection(@ConnectedSocket() client: Socket) {
    // Thêm client vào danh sách kết nối trước tiên
    this.kitchenClients.add(client);
    console.log(`Kitchen client joined: ${client.id}`);

    // Xác thực không bắt buộc ở đây, chỉ lưu trữ token nếu có
    try {
      const token = client.handshake.auth?.token;
      if (token) {
        // Lưu token vào socket data để sử dụng sau này
        client.data.token = token;
        // TODO: Có thể xác thực token ở đây nếu cần
      }
    } catch (error) {
      console.warn(`Authentication warning for client ${client.id}:`, error.message);
      // Không ngắt kết nối, chỉ ghi log cảnh báo
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.kitchenClients.delete(client);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('kitchen:join')
  handleJoinKitchen(@ConnectedSocket() client: Socket) {
    client.join('kitchen');
  }
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('kitchen:update_item')
  async handleUpdateItem(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string; itemId: string; status: OrderItemStatus }
  ) {
    // Broadcast item status change to all kitchen clients
    this.server.to('kitchen').emit('order:item_status_update', {
      orderId: data.orderId,
      itemId: data.itemId,
      status: data.status
    });
  }
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('kitchen:update_order')
  async handleUpdateOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string; status: OrderStatus }
  ) {
    // Broadcast order status change to all kitchen clients
    this.server.to('kitchen').emit('order:status_update', {
      orderId: data.orderId,
      status: data.status
    });
  }

  // Method to notify kitchen about new orders
  notifyNewOrder(order: any) {
    this.server.to('kitchen').emit('order:new', order);
  }

  // Method to notify kitchen about order updates
  notifyOrderUpdate(orderId: string, status: OrderStatus) {
    this.server.to('kitchen').emit('order:status_update', { orderId, status });
  }

  // Method to notify kitchen about order item updates
  notifyOrderItemUpdate(orderId: string, itemId: string, status: OrderItemStatus) {
    this.server.to('kitchen').emit('order:item_status_update', { orderId, itemId, status });
  }
}
