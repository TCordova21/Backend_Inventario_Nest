import { Module } from '@nestjs/common';
import { DisenoColorController } from './diseno-color.controller';
import { DisenoColorService } from './diseno-color.service';

@Module({
  controllers: [DisenoColorController],
  providers: [DisenoColorService]
})
export class DisenoColorModule {}
