import { Test, TestingModule } from '@nestjs/testing';
import { CorpRolesModuleController } from './corp-roles-module.controller';

describe('CorpRolesModuleController', () => {
  let controller: CorpRolesModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorpRolesModuleController],
    }).compile();

    controller = module.get<CorpRolesModuleController>(CorpRolesModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
