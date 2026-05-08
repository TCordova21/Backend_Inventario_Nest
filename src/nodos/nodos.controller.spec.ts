import { Test, TestingModule } from '@nestjs/testing';
import { NodosController } from './nodos.controller';

describe('NodosController', () => {
  let controller: NodosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodosController],
    }).compile();

    controller = module.get<NodosController>(NodosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
