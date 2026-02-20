import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sector } from './schemas/sector.schema';

@Injectable()
export class SectorsService {
  constructor(@InjectModel(Sector.name) private sectorModel: Model<Sector>) {}

  async create(name: string): Promise<Sector> {
    const existing = await this.sectorModel.findOne({ name }).exec();
    if (existing) {
      throw new ConflictException(`O setor "${name}" já existe.`);
    }
    const newSector = new this.sectorModel({ name });
    return newSector.save();
  }

  async findAll(): Promise<Sector[]> {
    return this.sectorModel.find().sort({ name: 1 }).exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.sectorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Setor não encontrado.');
    }
  }
}