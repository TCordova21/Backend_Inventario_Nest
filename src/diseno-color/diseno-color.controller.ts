import { Controller, Get, Post, Body, Param, Query, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDisenoColorDto } from './dto/create-diseno-color.dto';
import { DisenoColorService } from './diseno-color.service';

@ApiTags('Diseno-Color')
@Controller('diseno-color')
export class DisenoColorController {
  constructor(private readonly service: DisenoColorService) { }

  @Post()
  create(@Body() body: CreateDisenoColorDto) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('diseno/:id')
  findByDiseno(@Param('id') id: string) {
    return this.service.findByDiseno(Number(id));
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }


}