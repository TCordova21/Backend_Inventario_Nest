import { Test, TestingModule } from '@nestjs/testing';
import { NodosService } from './nodos.service';

describe('NodosService', () => {
  let service: NodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NodosService],
    }).compile();

    service = module.get<NodosService>(NodosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
