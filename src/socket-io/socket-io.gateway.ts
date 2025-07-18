import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Injectable, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './ws.guard';
import { info, error } from 'ps-logger';
import { DevicesService } from '../devices/devices.service';
import { WsDeviceGuard } from './ws-device.guard';
import { AllConfigType } from '../config/config.type';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => DevicesService))
    private readonly deviceService: DevicesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new WsException('Missing token');

      const jwtData = await this.jwtService.verifyAsync<JwtPayloadType>(token, {
        secret: this.configService.getOrThrow('auth.secret', {
          infer: true,
        }),
      });
      if (!jwtData) throw new WsException('Invalid token');

      client.data.user = jwtData;
      const room = `user/${jwtData.id}`;
      await client.join(room);
      info(`Client ${client.id} joined room: ${room}`);
    } catch (err) {
      error(`Client ${client.id} disconnected: ${err.message}`);
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    info(`Client disconnected: ${client.id}`);
  }

  onNewNotification(userId: string, data: any) {
    this.server.to(`user/${userId}`).emit('notification:created', data);
  }

  onUpdateNotification(userId: string, data: any) {
    this.server.to(`user/${userId}`).emit('notification:updated', data);
  }

  onDeleteNotification(userId: string, data: any) {
    this.server.to(`user/${userId}`).emit('notification:deleted', data);
  }

  @UseGuards(WsAuthGuard, WsDeviceGuard)
  @SubscribeMessage('join_device_room')
  async onJoinDeviceRoom(
    @MessageBody() device_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `device/${device_id}`;
    if (!client.rooms.has(room)) {
      await client.join(room);
      client.emit('joined_device_room', room);
      client.emit('device_data', client.data.device);
    }
  }

  @UseGuards(WsAuthGuard, WsDeviceGuard)
  @SubscribeMessage('leave_device_room')
  async onLeaveDeviceRoom(
    @MessageBody() device_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `device/${device_id}`;
    if (client.rooms.has(room)) {
      await client.leave(room);
      client.emit('leaved_device_room', room);
    }
  }

  @UseGuards(WsAuthGuard, WsDeviceGuard)
  @SubscribeMessage('device/update')
  async handleUpdateDevice(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!client.data.user) {
        client.emit('error', { error: 'Unauthorized' });
        return;
      }

      info(`Socket IO - Update device pin: ${JSON.stringify(data)}`);

      await this.deviceService.socketUpdate(data.id, data);
    } catch (err) {
      error(`Socket IO - ${err.message}`);
    }
  }

  emitToClients(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitToClient(clientId: string, event: string, data: any) {
    const client = this.server.sockets.sockets.get(clientId);
    if (client) {
      client.emit(event, data);
    }
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
}
