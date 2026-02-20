import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CorpRole } from './schemas/corp-role.schema';

@Injectable()
export class CorpRolesService {
    constructor(
        @InjectModel(CorpRole.name) private corpRoleModel: Model<CorpRole>,
    ) {}

    async create(name: string): Promise<CorpRole> {
        const existingRole = await this.corpRoleModel.findOne({ name });
        if (existingRole) {
            throw new ConflictException('Corporate role already exists');
        }
        const newRole = new this.corpRoleModel({ name });
        return newRole.save();
    }

    async findAll(): Promise<CorpRole[]> {
        return this.corpRoleModel.find().exec();
    }

    async remove(id: string): Promise<void> {
        const result = await this.corpRoleModel.findByIdAndDelete(id).exec();
        if (!result) {
        throw new NotFoundException('Corporate role not found');
        }
    }
}
