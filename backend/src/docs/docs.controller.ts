import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, Request } from '@nestjs/common';
import { DocsService } from './docs.service';
import { CreateDocDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('docs')
export class DocsController {
    constructor(private readonly docsService: DocsService){}

    @UseGuards(AuthGuard)
    @Post()
    async create(@Body() createDocumentDto: CreateDocDto) {
        return this.docsService.create(createDocumentDto);
    }

    @Get()
    async findAll() {
        return this.docsService.findAll();
    }

    @Get(':slug')
    async findOneBySlug(@Param('slug') slug: string) {
        return this.docsService.findOneBySlug(slug);
    }
    
    @UseGuards(AuthGuard)
    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    updateDocumentDto.updatedBy = req.user.sub; 
    return this.docsService.update(id, updateDocumentDto);
  }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.docsService.remove(id);
    }
}