import { Test, TestingModule } from '@nestjs/testing';
import { CorpRolesModuleService } from './corp-roles-module.service';

describe('CorpRolesModuleService', () => {
  let service: CorpRolesModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorpRolesModuleService],
    }).compile();

    service = module.get<CorpRolesModuleService>(CorpRolesModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
