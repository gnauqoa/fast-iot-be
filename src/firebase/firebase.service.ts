// firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  async sendNotification(
    token: string,
    payload: admin.messaging.MessagingPayload,
  ) {
    try {
      const response = await admin.messaging().send({
        token,
        ...payload,
      });
      return response;
    } catch (error) {
      console.error('FCM Error:', error);
      throw error;
    }
  }
}
