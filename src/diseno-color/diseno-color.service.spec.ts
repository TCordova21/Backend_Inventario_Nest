import { Test, TestingModule } from '@nestjs/testing';
import { DisenoColorService } from './diseno-color.service';

describe('DisenoColorService', () => {
  let service: DisenoColorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisenoColorService],
    }).compile();

    service = module.get<DisenoColorService>(DisenoColorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
