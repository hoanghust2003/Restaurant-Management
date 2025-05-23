import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { INestApplicationContext } from '@nestjs/common';

export class WebSocketAdapter extends IoAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const cors = {
      origin: ['http://localhost:3000'], // Add your client URLs here
      methods: ['GET', 'POST'],
      credentials: true,
    };

    const optionsWithCORS: Partial<ServerOptions> = {
      ...options,
      serveClient: false,
      cors,
      path: options?.path || '/socket.io',
    };

    // Remove adapter if it's undefined to prevent type error
    if (optionsWithCORS.adapter === undefined) {
      delete optionsWithCORS.adapter;
    }

    return super.createIOServer(port, optionsWithCORS as ServerOptions) as Server;
  }
}
