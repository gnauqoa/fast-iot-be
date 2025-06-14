// firebase.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const firebase = configService.get('firebase', { infer: true });
        return admin.initializeApp({
          credential: admin.credential.cert({
            projectId: firebase.projectId,
            clientEmail: firebase.clientEmail,
            privateKey: firebase.privateKey.replace(/\\n/g, '\n'),
          }),
        });
      },
    },
    FirebaseService,
  ],
  exports: [FirebaseService],
})
export class FirebaseModule {}
