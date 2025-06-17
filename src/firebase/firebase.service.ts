// firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface NotificationData {
  type: string;
  payload: Record<string, any>;
}

@Injectable()
export class FirebaseService {
  public sendNotification({
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
    const message: admin.messaging.Message = {
      data: {
        type: data.type,
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

    return new Promise((success, reject) =>
      admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log('Notification sent:', response);
          success(response);
        })
        .catch((error) => {
          console.error('Error sending notification:', error);
          reject(error);
        }),
    );
  }
}
