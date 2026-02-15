import 'dotenv/config';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { getToken } from 'next-auth/jwt';
import { prisma } from './src/lib/prisma';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Export Socket.io instance for use in API routes
let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io server not initialized');
  }
  return io;
}

// Extend Socket.io socket data interface
declare module 'socket.io' {
  interface SocketData {
    userId: string;
    userRole: string;
    userEmail: string;
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io server
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      // Extract NextAuth JWT token from handshake
      const token = await getToken({
        req: socket.request as any,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Reject unauthenticated connections
      if (!token || !token.id || !token.role || !token.email) {
        return next(new Error('UNAUTHORIZED'));
      }

      // Attach user data to socket for use in event handlers
      socket.data.userId = token.id as string;
      socket.data.userRole = token.role as string;
      socket.data.userEmail = token.email as string;

      next();
    } catch (error) {
      console.error('Socket.io authentication error:', error);
      next(new Error('UNAUTHORIZED'));
    }
  });

  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log('Socket.io client connected:', socket.id, 'User:', socket.data.userId);

    // Handle vault:join event
    socket.on('vault:join', async (vaultId: string) => {
      try {
        // Validate vaultId format (basic check)
        if (!vaultId || typeof vaultId !== 'string') {
          socket.emit('error', { message: 'Invalid vault ID' });
          return;
        }

        // Verify VaultUser membership
        const vaultUser = await prisma.vaultUser.findUnique({
          where: {
            userId_vaultId: {
              userId: socket.data.userId,
              vaultId: vaultId,
            },
          },
        });

        // Reject if user is not a member
        if (!vaultUser) {
          socket.emit('error', { message: 'Access denied to vault' });
          return;
        }

        // Join the vault room
        await socket.join(`vault:${vaultId}`);

        // Emit confirmation with role
        socket.emit('vault:joined', {
          vaultId: vaultId,
          role: vaultUser.role,
        });

        console.log(`User ${socket.data.userId} joined vault:${vaultId} as ${vaultUser.role}`);
      } catch (error) {
        console.error('Error in vault:join handler:', error);
        socket.emit('error', { message: 'Failed to join vault' });
      }
    });

    // Handle vault:leave event
    socket.on('vault:leave', async (vaultId: string) => {
      try {
        await socket.leave(`vault:${vaultId}`);
        console.log(`User ${socket.data.userId} left vault:${vaultId}`);
      } catch (error) {
        console.error('Error in vault:leave handler:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.io client disconnected:', socket.id, 'User:', socket.data.userId);
    });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
