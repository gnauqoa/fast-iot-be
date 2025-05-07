import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';
import { Schema as MongooseSchema } from 'mongoose';

export type ChannelSchemaDocument = HydratedDocument<Channels>;
export type ChannelValueType = string | number | boolean | object;
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  strict: false,
  collection: 'channels',
})
export class Channels extends EntityDocumentHelper {
  @Prop({ required: true })
  deviceId: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  value: string | number | boolean | object;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

export const ChannelSchema = SchemaFactory.createForClass(Channels);

ChannelSchema.index({ deviceId: 1, name: 1, value: 1 });
