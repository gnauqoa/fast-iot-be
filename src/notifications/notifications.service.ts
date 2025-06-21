import {
  // common
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdatenotificationDto } from './dto/update-notification.dto';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Notification } from './domain/notification';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SocketIoGateway } from '../socket-io/socket-io.gateway';

@Injectable()
export class NotificationsService {
  private readonly UNREAD_CACHE_PREFIX = 'unread_notifications:';
  private readonly UNREAD_CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly fireBaseService: FirebaseService,
    private readonly userService: UsersService,
    private readonly socketIoGateWay: SocketIoGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getUnreadCacheKey(userId: number) {
    return `${this.UNREAD_CACHE_PREFIX}${userId}`;
  }

  async getUnreadCount(userId: number): Promise<number> {
    const cacheKey = this.getUnreadCacheKey(userId);
    let count = await this.cacheManager.get<number>(cacheKey);
    if (typeof count === 'number' && count !== null) {
      return count;
    }
    count = await this.notificationRepository.countUnread(userId);
    await this.cacheManager.set(cacheKey, count, this.UNREAD_CACHE_TTL);
    return count;
  }

  private async invalidateUnreadCache(userId: number) {
    await this.cacheManager.del(this.getUnreadCacheKey(userId));
  }

  async create(createnotificationDto: CreateNotificationDto) {
    const user = await this.userService.findById(createnotificationDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user?.firebaseToken)
      await this.fireBaseService.sendNotification({
        token: user.firebaseToken,
        title: createnotificationDto.title,
        body: createnotificationDto.body,
        data: {
          payload: createnotificationDto.data,
        },
      });

    const result = await this.notificationRepository.create({
      title: createnotificationDto.title,
      body: createnotificationDto.body,
      data: createnotificationDto.data,
      userId: createnotificationDto.userId,
      isRead: false,
    });

    await this.socketIoGateWay.onNewNotification(user.id.toString(), {
      payload: result,
    });

    await this.invalidateUnreadCache(createnotificationDto.userId);
    return result;
  }

  async findAllWithPagination({
    paginationOptions,
    userId,
  }: {
    paginationOptions: IPaginationOptions;
    userId: number;
  }) {
    const [data, total] = await Promise.all([
      this.notificationRepository.findAllWithPagination({
        paginationOptions: {
          page: paginationOptions.page,
          limit: paginationOptions.limit,
        },
        userId,
      }),
      this.notificationRepository.count(userId),
    ]);

    return {
      data,
      total,
    };
  }

  findById(id: Notification['id']) {
    return this.notificationRepository.findById(id);
  }

  findByIds(ids: Notification['id'][]) {
    return this.notificationRepository.findByIds(ids);
  }

  async update(
    id: Notification['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updatenotificationDto: UpdatenotificationDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.notificationRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Notification['id']) {
    return this.notificationRepository.remove(id);
  }

  async updateIsRead(id: string) {
    const notification = await this.notificationRepository.findById(id);
    if (notification) {
      await this.invalidateUnreadCache(notification.userId);
      await this.socketIoGateWay.onUpdateNotification(
        notification.userId.toString(),
        { payload: notification },
      );
    }
    return this.notificationRepository.update(id, { isRead: true });
  }

  async updateIsReadAll(userId: number) {
    await this.invalidateUnreadCache(userId);
    const reuslts = await this.notificationRepository.bulkUpdate(
      {
        userId,
      },
      {
        isRead: true,
      },
    );

    if (reuslts.length) {
      await this.socketIoGateWay.onUpdateNotification(userId.toString(), {
        payload: reuslts,
      });
    }
    return reuslts;
  }

  async delete(id: string) {
    const notification = await this.notificationRepository.findById(id);
    if (notification) {
      if (!notification.isRead) {
        await this.invalidateUnreadCache(notification.userId);
      }
      await this.socketIoGateWay.onDeleteNotification(
        notification.userId.toString(),
        { payload: notification, type: 'deleted' },
      );
    }
    return this.notificationRepository.remove(id);
  }
}
