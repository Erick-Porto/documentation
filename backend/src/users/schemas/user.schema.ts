import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['superadmin', 'admin', 'user'], default: 'user' })
  role: string;

  @Prop({ type: [Types.ObjectId], ref: 'Sector' })
  sector: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'CorpRole' })
  corpRoles: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'Document' }])
  completedDocs: Types.ObjectId[];

  @Prop({ default: 'https://linkedin.com/'})
  linkedin?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);