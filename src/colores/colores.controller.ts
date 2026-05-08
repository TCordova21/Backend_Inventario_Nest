import { Controller, Get, Post, Body, Query, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateColorDto } from './dto/create-color.dto';
import { ColoresService } from './colores.service';
import { UpdateColorDto } from './dto/update-color.dto';

@ApiTags('Colores')
@Controller('colores')
export class ColoresController {
  constructor(private readonly service: ColoresService) {}

  @Post()
  create(@Body() body: CreateColorDto) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('search')
  findByNombre(@Query('nombre') nombre: string) {
    return this.service.findByNombre(nombre);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
  

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateColorDto) {
    return this.service.updated(Number(id), body);  
  }


}