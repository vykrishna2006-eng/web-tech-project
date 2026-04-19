import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketServer;

export const initSocket = (server: HTTPServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      (socket as Socket & { userId: string }).userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as Socket & { userId: string }).userId;
    socket.join(`user:${userId}`);
    console.log(`🔌 User ${userId} connected`);

    socket.on('disconnect', () => {
      console.log(`🔌 User ${userId} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};
