// firebase.service.ts
import { Injectable, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface NotificationData {
  payload: Record<string, any>;
}

@Injectable()
export class FirebaseService {
  constructor(
    @Optional() @Inject('FIREBASE_ADMIN') private firebaseAdmin: admin.app.App,
    private configService: ConfigService,
  ) {}

  private isFirebaseEnabled(): boolean {
    const firebase = this.configService.get('firebase', { infer: true });
    return firebase?.enabled ?? false;
  }

  public async sendNotification({
    token,
    title,
    body,
    data,
  }: {
    token: string;
    title: string;
    body: string;
    data: NotificationData;
  }): Promise<string> {
    if (!this.isFirebaseEnabled()) {
      console.warn('Firebase is disabled. Notification not sent.');
      throw new Error('Firebase is disabled due to missing configuration');
    }

    if (!this.firebaseAdmin) {
      console.error('Firebase admin is not initialized');
      throw new Error('Firebase admin is not initialized');
    }

    const message: admin.messaging.Message = {
      data: {
        payload: JSON.stringify(data.payload),
      },
      android: {
        notification: {
          title,
          body,
          defaultSound: true as any, // workaround for type
          notificationCount: 1,
          // sound: 'boat_rescue.mp3',
          // channelId: 'boat_rescue_chanel',
        },
        ttl: 2000,
      },
      token: token,
    };

    return new Promise((resolve, reject) =>
      this.firebaseAdmin
        .messaging()
        .send(message)
        .then((response) => {
          console.log('Notification sent:', response);
          resolve(response);
        })
        .catch((error) => {
          console.error('Error sending notification:', error);
          reject(error);
        }),
    );
  }
}
