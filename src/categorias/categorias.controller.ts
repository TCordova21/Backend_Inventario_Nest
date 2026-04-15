import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Post()
  @ApiBody({ type: CreateCategoriaDto })
  create(@Body() body: CreateCategoriaDto) {
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

    @Get('producto/:producto_id')
  findCategoriasByProducto(@Param('producto_id') producto_id: string) {
    return this.service.findCategoriasByProducto(Number(producto_id));
  }

  @Put(':id')
  @ApiBody({ type: UpdateCategoriaDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateCategoriaDto,
  ) {
    return this.service.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}