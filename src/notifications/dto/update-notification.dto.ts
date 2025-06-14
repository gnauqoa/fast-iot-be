// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-Notification.dto';

export class UpdatenotificationDto extends PartialType(CreateNotificationDto) {}
