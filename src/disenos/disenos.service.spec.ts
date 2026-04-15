import { Test, TestingModule } from '@nestjs/testing';
import { DisenosService } from './disenos.service';

describe('DisenosService', () => {
  let service: DisenosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisenosService],
    }).compile();

    service = module.get<DisenosService>(DisenosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
