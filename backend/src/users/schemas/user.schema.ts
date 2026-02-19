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
  password: string; // Lembre-se: no Service, teremos que fazer o hash (bcrypt) antes de salvar!

  @Prop({ enum: ['admin', 'user'], default: 'user' }) // Define um valor padrão
  role: string;

  @Prop({ required: true, default: 'TI' })
  corp_role: string;

  @Prop([{ type: Types.ObjectId, ref: 'Document' }])
  completedDocs: Types.ObjectId[];

  @Prop({ default: 'https://linkedin.com/'})
  linkedin?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);