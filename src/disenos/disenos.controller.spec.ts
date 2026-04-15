import { Test, TestingModule } from '@nestjs/testing';
import { DisenosController } from './disenos.controller';

describe('DisenosController', () => {
  let controller: DisenosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisenosController],
    }).compile();

    controller = module.get<DisenosController>(DisenosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
