import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
@Injectable()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server; // ✅ FIXED

  clients = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

  afterInit(server: Server) {
    // ✅ FIXED
    this.server = server;
    console.log('Initialized socket server');
  }

  getSocket(): Server {
    return this.server;
  }

  getClients() {
    return Array.from(this.clients.keys());
  }

  getUserId(clientId: string) {
    for (const [userId, socketId] of this.clients) {
      if (socketId === clientId) {
        return userId;
      }
    }
    return '';
  }

  getSocketId(userId: string) {
    return this.clients.get(userId);
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      console.log('User Id is not provided');
      client.disconnect();
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, id: true },
    });

    if (!user) {
      console.log('No user found');
      client.disconnect();
      return;
    }

    this.clients.set(userId, client.id);
    this.server.emit('connected-users', this.getClients()); // ✅ use server

    console.log(`User ${user.name} connected with client id: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const userId = this.getUserId(client.id);

    if (!userId)
      return console.log('No userId found for the client: ', client.id);

    this.clients.delete(userId);
    this.server.emit('connected-users', this.getClients()); // ✅ use server
    console.log(`User ${userId} disconnected with client id: ${client.id}`);
  }
}
