import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initializeSocket(userId: string) {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000', {
        withCredentials: true,
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        
        // Join as customer
        this.socket.emit('customer:join', { userId });
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  // Join kitchen room (for kitchen staff)
  joinKitchen() {
    if (this.socket) {
      this.socket.emit('kitchen:join');
    }
  }

  // Get the socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Listen for order status updates
  onOrderStatusChange(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('order:status_update', callback);
    }
  }

  // Listen for order item status updates
  onOrderItemStatusChange(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('order:item_status_update', callback);
    }
  }

  // Clean up listeners and disconnect
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = SocketService.getInstance();
