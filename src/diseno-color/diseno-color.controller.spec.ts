import { Test, TestingModule } from '@nestjs/testing';
import { DisenoColorController } from './diseno-color.controller';

describe('DisenoColorController', () => {
  let controller: DisenoColorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisenoColorController],
    }).compile();

    controller = module.get<DisenoColorController>(DisenoColorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
