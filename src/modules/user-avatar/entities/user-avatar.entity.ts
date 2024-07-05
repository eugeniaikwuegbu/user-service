import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { AbstractDocument } from '../../../configurations/database';
import { User } from '../../users/entities/user.entity';

export type UserAvatarDocument = UserAvatar & Document;

@Schema()
export class File {
  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  originalname: string;
  @Prop({ required: true })
  fieldname: string;
  @Prop({ required: true })
  encoding: string;
  @Prop({ required: true })
  mimetype: string;
  @Prop({ required: true })
  buffer: Buffer;
  @Prop({ required: true })
  size: number;
}

@Schema({ versionKey: false, timestamps: true })
export class UserAvatar extends AbstractDocument {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: User;

  @Prop({ required: true })
  hash: string;

  @Prop({ required: true, type: File })
  file: File;

  @Prop({ required: true })
  fileBase64: string;
}

export const UserAvatarSchema = SchemaFactory.createForClass(UserAvatar);

export const UserAvatarSchemaDefinition = {
  name: UserAvatar.name,
  schema: UserAvatarSchema,
};
