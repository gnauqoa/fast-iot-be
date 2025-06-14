import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class NotificationOwnershipGuard implements CanActivate {
  constructor(private readonly notificationsService: NotificationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const notificationId = request.params.id;

    if (!user || !notificationId) {
      throw new ForbiddenException('Invalid request');
    }

    const notification =
      await this.notificationsService.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (user.role.id !== RoleEnum.admin && notification.userId !== user.id) {
      throw new ForbiddenException(
        'Permission denied: You can only access your own notifications',
      );
    }

    request.notification = notification;
    return true;
  }
}
