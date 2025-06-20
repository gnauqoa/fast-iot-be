import { ApiProperty } from '@nestjs/swagger';

export class Notification {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  body: string;

  @ApiProperty({ type: Object })
  data: object;

  @ApiProperty({ type: Boolean })
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
