import { Controller, Get, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { AuthGuard } from '../auth/auth.guard'; // Ajuste o caminho conforme o seu projeto

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return this.tagsService.findAll();
  }
}