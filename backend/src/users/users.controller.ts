import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/auth/decorators/public.decorator';
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('me/progress/:docId')
  async updateProgress(
    @Request() req: any, 
    @Param('docId') docId: string, 
    @Body('percentage') percentage: number
  ) {
    return this.usersService.updateProgress(req.user.sub, docId, percentage);
  }
  

  @Post('me/complete/:docId')
  async completeDoc(@Request() req: any, @Param('docId') docId: string) {
    return this.usersService.completeDocument(req.user.sub, docId);
  }

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('superadmin', 'admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('superadmin', 'admin')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
    
  @Patch(':id')
  @Roles('superadmin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}