import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDoc, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Progress extends MongooseDoc {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Document', required: true })
  docId: Types.ObjectId;

  @Prop({ default: true })
  isCompleted: boolean;

  @Prop({ default: 0 })
  highestPercentage: number;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);