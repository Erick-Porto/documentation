import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SectorsController } from './sectors.controller';
import { SectorsService } from './sectors.service';
import { Sector, SectorSchema } from './schemas/sector.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sector.name, schema: SectorSchema }])],
  controllers: [SectorsController],
  providers: [SectorsService],
  exports: [MongooseModule] // Exportamos para o futuro módulo de Usuários e Documentos
})
export class SectorsModule {}