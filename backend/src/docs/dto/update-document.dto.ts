import { PartialType } from '@nestjs/mapped-types';
import { CreateDocDto } from './create-document.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDocumentDto extends PartialType(CreateDocDto) {
  @IsString()
  @IsOptional()
  updatedBy?: string;
}