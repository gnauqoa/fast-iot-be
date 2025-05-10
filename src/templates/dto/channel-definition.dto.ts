import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ChannelType } from '../domain/enums/channel-type.enum';

export class ChannelDefinitionDto {
  @ApiProperty({
    type: String,
    description: 'Name of the channel',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: ChannelType,
    description: 'Type of the channel',
  })
  @IsEnum(ChannelType)
  @IsNotEmpty()
  type: ChannelType;
}
