import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IChannelDefinition,
  IPrototype,
  PrototypeDefinition,
} from '../../../../domain/template';

export type TemplateSchemaDocument = HydratedDocument<Templates>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  toObject: {
    virtuals: true,
    getters: true,
  },
})
export class Templates extends EntityDocumentHelper {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 100 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: false, trim: true, minlength: 10, maxlength: 500 })
  @IsString()
  @IsNotEmpty()
  description: string;

  @Prop({ required: false, type: Number })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @Prop({
    required: true,
    default: [],
    type: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => Object)
  channels: IChannelDefinition[];

  @Prop({
    type: Object,
    default: {
      nodes: [],
      edges: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    },
  })
  @ValidateNested()
  @Type(() => PrototypeDefinition)
  @IsOptional()
  @Transform(({ value }) => {
    return value ?? {};
  })
  desktopPrototype?: IPrototype;

  @Prop({
    type: Object,
    default: {
      nodes: [],
      edges: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    },
  })
  @ValidateNested()
  @Type(() => PrototypeDefinition)
  @IsOptional()
  @Transform(({ value }) => {
    return value ?? {};
  })
  mobilePrototype?: IPrototype;

  @Prop({ required: true, default: false })
  @IsBoolean()
  public: boolean;

  @Prop({ type: Date, default: now })
  @IsDate()
  createdAt: Date;

  @Prop({ type: Date, default: now })
  @IsDate()
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  @IsDate()
  @IsOptional()
  deletedAt: Date | null;
}

export const TemplateSchema = SchemaFactory.createForClass(Templates);

// Add indexes for better query performance
TemplateSchema.index({ userId: 1 });
TemplateSchema.index({ public: 1 });
TemplateSchema.index({ createdAt: -1 });
