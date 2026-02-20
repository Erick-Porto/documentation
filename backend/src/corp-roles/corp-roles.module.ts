import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CorpRole, CorpRolesSchema } from './schemas/corp-role.schema';
import { CorpRolesService } from './corp-roles.service';
import { CorpRolesController } from './corp-roles.controller';

@Module({
    imports: [MongooseModule.forFeature([{name: CorpRole.name, schema: CorpRolesSchema}])],
    providers: [CorpRolesService],
    controllers: [CorpRolesController],
    exports: [CorpRolesService],
})
export class CorpRolesModule {}