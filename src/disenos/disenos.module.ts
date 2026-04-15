import { Module } from '@nestjs/common';
import { DisenosController } from './disenos.controller';
import { DisenosService } from './disenos.service';

@Module({
  controllers: [DisenosController],
  providers: [DisenosService]
})
export class DisenosModule {}
