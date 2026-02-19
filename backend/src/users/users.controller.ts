import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch('me/progress/:docId')
  async updateProgress(
    @Request() req: any, 
    @Param('docId') docId: string, 
    @Body('percentage') percentage: number
  ) {
    return this.usersService.updateProgress(req.user.sub, docId, percentage);
  }
  
  @UseGuards(AuthGuard)
  @Post('me/complete/:docId')
  async completeDoc(@Request() req: any, @Param('docId') docId: string) {
    return this.usersService.completeDocument(req.user.sub, docId);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
    
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}