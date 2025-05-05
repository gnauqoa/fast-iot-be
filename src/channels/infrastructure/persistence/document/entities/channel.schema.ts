import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type ChannelSchemaDocument = HydratedDocument<Channels>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  strict: false,
})
export class Channels extends EntityDocumentHelper {
  @Prop({ required: true })
  deviceId: number;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

export const ChannelSchema = SchemaFactory.createForClass(Channels);
