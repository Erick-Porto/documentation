import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Document, DocumentDocument } from './schemas/document.schema';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateDocDto } from './dto/create-document.dto';
import { Tag } from '../tags/schemas/tags.schema';

@Injectable()
export class DocsService {
    constructor(
        @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
        @InjectModel(Tag.name) private tagModel: Model<Tag>
    ){}

    private async processTags(tags?: string[]): Promise<Types.ObjectId[]> {
        const tagObjectIds: Types.ObjectId[] = [];
        
        if (!tags || tags.length === 0) return tagObjectIds;

        for (const tagName of tags) {
            const cleanName = tagName.trim();
            const tag = await this.tagModel.findOneAndUpdate(
                { name: cleanName },
                { name: cleanName },
                { upsert: true, new: true }
            ).exec();

            tagObjectIds.push(tag._id as Types.ObjectId);
        }
        
        return tagObjectIds;
    }

    async create(createDocumentDto: CreateDocDto): Promise<Document> {
        const existingDoc = await this.documentModel.findOne({ slug: createDocumentDto.slug }).exec();
        if (existingDoc) {
            throw new ConflictException(`Documento com o slug "${createDocumentDto.slug}" já existe.`);
        }

        const finalTags = await this.processTags(createDocumentDto.tags);

        const documentData = {
            ...createDocumentDto,
            tags: finalTags
        };

        const createdDocument = new this.documentModel(documentData);
        return createdDocument.save();
    }

    async findAll(): Promise<Document[]> {
        return this.documentModel.find()
            .populate('authorId', 'name')
            .populate('updatedBy', 'name')
            .populate('tags', 'name')
            .populate('targetSector', 'name')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findOneBySlug(slug: string): Promise<Document> {
        const document = await this.documentModel.findOne({ slug })
            .populate('authorId', 'name linkedin corp_role')
            .populate('updatedBy', 'name')
            .populate('tags', 'name')
            .populate('targetSector', 'name')
            .exec();

        if (!document) {
            throw new NotFoundException(`Tutorial com slug "${slug}" não encontrado`);
        }
        return document;
    }

    async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
        let updatedData = { ...updateDocumentDto };

        if (updateDocumentDto.tags) {
            updatedData.tags = await this.processTags(updateDocumentDto.tags) as any;
        }

        const updatedDocument = await this.documentModel.findByIdAndUpdate(
            id, 
            updatedData, 
            { returnDocument: 'after' } 
        ).exec();
        
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