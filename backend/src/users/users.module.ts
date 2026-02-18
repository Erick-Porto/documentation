import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { Progress, ProgressSchema } from './schemas/progress.schema';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Progress.name, schema: ProgressSchema }
  ])],
  exports: [UsersService],
})
export class UsersModule {}
