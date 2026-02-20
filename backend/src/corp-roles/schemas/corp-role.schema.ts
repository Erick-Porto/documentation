import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CorpRole extends Document {
  @Prop({ required: true, unique: true })
  name: string;
}

export const CorpRolesSchema = SchemaFactory.createForClass(CorpRole);