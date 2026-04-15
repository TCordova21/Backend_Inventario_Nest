import { Test, TestingModule } from '@nestjs/testing';
import { SubcategoriasController } from './subcategorias.controller';

describe('SubcategoriasController', () => {
  let controller: SubcategoriasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubcategoriasController],
    }).compile();

    controller = module.get<SubcategoriasController>(SubcategoriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
