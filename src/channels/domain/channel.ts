import { ApiProperty } from '@nestjs/swagger';

export class Channel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: Number,
  })
  deviceId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
