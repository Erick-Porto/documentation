import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocsModule } from './docs/docs.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TagsController } from './tags/tags.controller';
import { TagsService } from './tags/tags.service';
import { TagsModule } from './tags/tags.module';
import { SectorsController } from './sectors/sectors.controller';
import { SectorsService } from './sectors/sectors.service';
import { SectorsModule } from './sectors/sectors.module';
import { CorpRolesController } from './corp-roles/corp-roles.controller';
import { CorpRolesService } from './corp-roles/corp-roles.service';
import { CorpRolesModule } from './corp-roles/corp-roles.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://mongodb:27017/company_docs'),
    DocsModule,
    UsersModule,
    AuthModule,
    TagsModule,
    SectorsModule,
    CorpRolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}