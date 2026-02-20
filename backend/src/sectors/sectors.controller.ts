import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SectorsService } from './sectors.service';
import { AuthGuard } from '../auth/auth.guard'; // Ajuste o caminho se necessário

@UseGuards(AuthGuard)
@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Post()
  async create(@Body('name') name: string) {
    return this.sectorsService.create(name);
  }

  @Get()
  async findAll() {
    return this.sectorsService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sectorsService.remove(id);
  }
}