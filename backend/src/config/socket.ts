import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env';

let io: Server | null = null;

export const initializeSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a vehicle room for real-time bid updates
    socket.on('join-vehicle', (vehicleId: string) => {
      socket.join(`vehicle-${vehicleId}`);
      console.log(`👁️ Client ${socket.id} joined vehicle-${vehicleId}`);
    });

    // Leave a vehicle room
    socket.on('leave-vehicle', (vehicleId: string) => {
      socket.leave(`vehicle-${vehicleId}`);
      console.log(`👋 Client ${socket.id} left vehicle-${vehicleId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit new bid notification to all clients watching a vehicle
export const emitNewBid = (vehicleId: string, bidData: any) => {
  if (io) {
    io.to(`vehicle-${vehicleId}`).emit('new-bid', bidData);
  }
};

// Emit vehicle price update
export const emitPriceUpdate = (vehicleId: string, priceData: any) => {
  if (io) {
    io.to(`vehicle-${vehicleId}`).emit('price-update', priceData);
  }
};
