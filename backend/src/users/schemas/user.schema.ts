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

  @Prop({ default: 'admin' }) // Define um valor padrão
  role: string;

  @Prop([{ type: Types.ObjectId, ref: 'Document' }])
  completedDocs: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);