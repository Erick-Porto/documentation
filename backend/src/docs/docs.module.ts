import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';
import { Document, DocumentSchema } from './schemas/document.schema';
import { TagsModule } from 'src/tags/tags.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]),
    TagsModule
  ],
  controllers: [DocsController],
  providers: [DocsService],
})
export class DocsModule {}