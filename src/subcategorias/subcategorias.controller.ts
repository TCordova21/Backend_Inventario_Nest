import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubcategoriaDto } from './dto/create-subcategorias.dto';
import { SubcategoriasService } from './subcategorias.service';

@ApiTags('Subcategorias')
@Controller('subcategorias')
export class SubcategoriasController {
  constructor(private readonly service: SubcategoriasService) {}

  @Post()
  create(@Body() body: CreateSubcategoriaDto) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('categoria/:id')
  findByCategoria(@Param('id') id: string) {
    return this.service.findByCategoria(Number(id));
  }
}