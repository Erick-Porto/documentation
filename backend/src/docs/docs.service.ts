import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from './schemas/document.schema';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateDocDto } from './dto/create-document.dto';

@Injectable()
export class DocsService {
    constructor(
        @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    ){}

    async create(createDocumentDto: CreateDocDto): Promise<Document> {
        const createdDocument = new this.documentModel(createDocumentDto);
        return createdDocument.save();
    }

    async findAll(): Promise<Document[]> {
        return this.documentModel.find().exec();
    }

    async findOneBySlug(slug: string): Promise<Document> {
        const document = await this.documentModel.findOne({ slug }).exec();
        if (!document) {
            throw new NotFoundException(`Document with slug "${slug}" not found`);
        }
        return document;
    }

    async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
        const updatedDocument = await this.documentModel.findOneAndUpdate({ id }, updateDocumentDto, { new: true }).exec();
        if (!updatedDocument) {
            throw new NotFoundException(`Document with id "${id}" not found`);
        }
        return updatedDocument;
    }

    async remove(id: string): Promise<void> {
        const deletedDocument = await this.documentModel.findByIdAndDelete(id).exec();
        if (!deletedDocument) {
            throw new NotFoundException(`Document with id "${id}" not found`);
        }
        return;
    }
}