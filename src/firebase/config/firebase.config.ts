import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { FirebaseConfig } from './firebase-type.config';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  @IsOptional()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  @IsOptional()
  FIREBASE_PRIVATE_KEY: string;
}

export default registerAs<FirebaseConfig>('firebase', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ?? '',
  };
});
