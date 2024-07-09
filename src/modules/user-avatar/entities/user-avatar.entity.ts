import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../../configurations/database';

export type UserAvatarDocument = UserAvatar & Document;

@Schema({ versionKey: false, timestamps: true })
export class UserAvatar extends AbstractDocument {
  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileBase64: string;
}

export const UserAvatarSchema = SchemaFactory.createForClass(UserAvatar);

export const UserAvatarSchemaDefinition = {
  name: UserAvatar.name,
  schema: UserAvatarSchema,
};
