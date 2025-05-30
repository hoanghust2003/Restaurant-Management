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
import { UseGuards, Logger, Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { OrderStatus, OrderItemStatus } from '../enums/order-status.enum';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  },
  namespace: '/kitchen'
})
@UseGuards(JwtAuthGuard)
export class KitchenGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KitchenGateway.name);
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private kitchenClients: Set<Socket> = new Set();

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake?.auth?.token;
      if (!token) {
        this.logger.error('Authentication failed - no token provided');
        client.disconnect();
        return;
      }

      // Validate user role
      try {
        const payload = this.jwtService.verify(token);
        if (!payload || !['admin', 'chef'].includes(payload.role)) {
          this.logger.error(`Unauthorized role: ${payload?.role}`);
          client.disconnect();
          return;
        }
        
        // Store user info in socket data
        client.data.user = {
          userId: payload.sub,
          role: payload.role,
          email: payload.email
        };

        this.kitchenClients.add(client);
        this.logger.log(`Kitchen client connected: ${client.id} (${payload.role})`);
      } catch (error) {
        this.logger.error(`Token verification failed: ${error.message}`);
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
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
