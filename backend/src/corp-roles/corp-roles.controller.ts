import {Controller, Get, Post, Body, Param, UseGuards, Delete} from '@nestjs/common';
import { CorpRolesService } from './corp-roles.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('corp-roles')
export class CorpRolesController {
    constructor(private readonly corpRolesService: CorpRolesService) {}

    @Post()
    async create(@Body('name') name: string) {
        return this.corpRolesService.create(name);
    }

    @Get()
    async findAll() {
        return this.corpRolesService.findAll();
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.corpRolesService.remove(id);
    }
}