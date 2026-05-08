import { Module } from '@nestjs/common';
import { NodosController } from './nodos.controller';
import { NodosService } from './nodos.service';

@Module({
  controllers: [NodosController],
  providers: [NodosService]
})
export class NodosModule {}
