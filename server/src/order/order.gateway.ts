import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Order } from './entities/order.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, specify your frontend URL
  },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OrderGateway.name);
  
  @WebSocketServer()
  server: Server;

  private kitchenClients: Socket[] = [];

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Listen for client role identification
    client.on('identify', (role: string) => {
      if (role === 'kitchen') {
        this.logger.log(`Kitchen client connected: ${client.id}`);
        this.kitchenClients.push(client);
      }
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove from kitchen clients if it was one
    this.kitchenClients = this.kitchenClients.filter(c => c.id !== client.id);
  }

  // Notify kitchen about new orders
  notifyNewOrder(order: Order) {
    this.logger.log(`Broadcasting new order: ${order.id}`);
    this.server.emit('newOrder', order);
  }

  // Notify about order status changes
  notifyOrderStatusUpdated(order: Order) {
    this.logger.log(`Broadcasting order status update: ${order.id} - ${order.status}`);
    this.server.emit('orderStatusUpdated', order);
  }

  // Kitchen staff can mark orders as "in progress"
  @SubscribeMessage('startPreparing')
  handleStartPreparing(client: Socket, orderId: number) {
    this.logger.log(`Kitchen started preparing order: ${orderId}`);
    return { event: 'orderStartedPreparing', data: orderId };
  }

  // Kitchen staff can mark orders as "ready"
  @SubscribeMessage('orderReady')
  handleOrderReady(client: Socket, orderId: number) {
    this.logger.log(`Kitchen marked order as ready: ${orderId}`);
    return { event: 'orderIsReady', data: orderId };
  }

  // Get number of connected kitchen clients
  getKitchenClientCount(): number {
    return this.kitchenClients.length;
  }
}