// 1:20:src/channels/domain/channel.ts
import { ApiProperty } from '@nestjs/swagger';
import { ChannelValueType } from '../infrastructure/persistence/document/entities/channel.schema';

export class Channel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: Number,
  })
  deviceId: number;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'boolean' },
      { type: 'object' },
    ],
  })
  value: ChannelValueType;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
