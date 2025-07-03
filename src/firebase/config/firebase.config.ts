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

  const projectId = process.env.FIREBASE_PROJECT_ID ?? '';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? '';
  const privateKey = process.env.FIREBASE_PRIVATE_KEY ?? '';

  // Firebase is enabled only if all required config values are present and not empty
  const enabled = !!(projectId && clientEmail && privateKey);

  return {
    enabled,
    projectId,
    clientEmail,
    privateKey,
  };
});
