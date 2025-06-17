import {
  // common
  Injectable,
  Inject,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-Notification.dto';
import { UpdatenotificationDto } from './dto/update-Notification.dto';
import { NotificationRepository } from './infrastructure/persistence/Notification.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Notification } from './domain/Notification';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class NotificationsService {
  private readonly UNREAD_CACHE_PREFIX = 'unread_notifications:';
  private readonly UNREAD_CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly fireBaseService: FirebaseService,
    private readonly userService: UsersService,
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
    if (user?.firebaseToken)
      await this.fireBaseService.sendNotification({
        token: user.firebaseToken,
        title: createnotificationDto.title,
        body: createnotificationDto.body,
        data: {
          type: 'notification',
          payload: JSON.parse(createnotificationDto.data),
        },
      });

    const result = await this.notificationRepository.create({
      title: createnotificationDto.title,
      body: createnotificationDto.body,
      data: createnotificationDto.data,
      userId: createnotificationDto.userId,
      isRead: false,
    });
    await this.invalidateUnreadCache(createnotificationDto.userId);
    return result;
  }

  findAllWithPagination({
    paginationOptions,
    userId,
  }: {
    paginationOptions: IPaginationOptions;
    userId: number;
  }) {
    return this.notificationRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      userId,
    });
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
    }
    return this.notificationRepository.update(id, { isRead: true });
  }

  async bulkUpdateIsRead(ids: string[], userId: number) {
    await this.invalidateUnreadCache(userId);
    return this.notificationRepository.bulkUpdate(
      {
        _id: { $in: ids },
        userId,
      },
      {
        isRead: true,
      },
    );
  }
}
