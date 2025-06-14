// notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async sendToDevice(dto: SendNotificationDto) {
    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: dto.title,
        body: dto.body,
      },
      data: dto.data || {},
    };

    return this.firebaseService.sendNotification(dto.token, payload);
  }
}
