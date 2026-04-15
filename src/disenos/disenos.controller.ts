import { Controller, Get, Post, Body, Param, Put, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDisenoDto } from './dto/create-diseno.dto';
import { UpdateDisenoDto } from './dto/update-diseno.dto';
import { DisenosService } from './disenos.service';

@ApiTags('Diseños')
@Controller('disenos')
export class DisenosController {
  constructor(private readonly service: DisenosService) {}

  @Post()
  create(@Body() body: CreateDisenoDto) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Get('subcategoria/:id')
  findBySubcategoria(@Param('id') id: string) {
    return this.service.findBySubcategoria(Number(id));
  }

 @Patch(':id') // Cambiado de @Put a @Patch
  update(@Param('id') id: string, @Body() body: UpdateDisenoDto) { // Usa el Dto de update
  return this.service.update(Number(id), body);
}

}