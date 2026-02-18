import { PartialType } from '@nestjs/mapped-types';
import { CreateDocDto } from './create-document.dto';

export class UpdateDocumentDto extends PartialType(CreateDocDto) {}