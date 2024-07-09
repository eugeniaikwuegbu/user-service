import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Document } from 'mongoose';
import { AbstractDocument } from '../../../configurations/database';

export type UserDocument = User & Document;

@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractDocument {
  @Prop({ trim: true, lowercase: true, required: true, unique: true })
  email: string;

  @Prop({ trim: true, required: true })
  firstName: string;

  @Prop({ trim: true, required: true })
  lastName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaDefinition = { name: User.name, schema: UserSchema };
