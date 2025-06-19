import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Injectable, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './ws.guard';
import { info, error } from 'ps-logger';
import { DevicesService } from '../devices/devices.service';
import { WsDeviceGuard } from './ws-device.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UsersCrudService } from '../users/users-crud.service';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(forwardRef(() => UsersCrudService))
    private readonly usersCrudService: UsersCrudService,
  ) {}

  async handleConnection(client: Socket) {
    info(`Client connected: ${client.id}`);
    // If user is authenticated, store userId -> channelId mapping
    const user = client.data?.user;
    if (user && user.id) {
      this.saveChannelId(user.id, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    info(`Client disconnected: ${client.id}`);
  }

  async sendNotification(userId: string, data: any) {
    const userData = await this.getChannelId(userId);
    if (userData) {
      this.server.to(userData.channelId).emit('notification', data);
    }
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
      await client.join('notifications');
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

  saveChannelId(userId: string, channelId: string) {
    this.cacheManager.set(`user:channel:${userId}`, { channelId });
  }

  async getChannelId(userId: string): Promise<{ channelId: string } | null> {
    return await this.cacheManager.get(`user:channel:${userId}`);
  }

  removeChannelId(userId: string) {
    this.cacheManager.del(`user:channel:${userId}`);
  }
}
