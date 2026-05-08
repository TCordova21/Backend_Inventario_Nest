import { Controller, Get, Post, Body, Param, Delete, Patch ,ParseIntPipe } from '@nestjs/common';
import { DisenosService } from './disenos.service';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateDisenoDto } from './dto/create-diseno.dto';
import { UpdateDisenoDto } from './dto/update-diseno.dto';

@ApiTags('Disenos')
@Controller('disenos')
export class DisenosController {
  constructor(private readonly service: DisenosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo diseño dentro de un nodo' })
  @ApiBody({ type: CreateDisenoDto })
  create(@Body() body: CreateDisenoDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los diseños' })
  findAll() {
    return this.service.findAll();
  }

  @Get('nodo/:id')
  @ApiOperation({ summary: 'Obtener diseños de un nodo específico' })
  findByNodo(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByNodo(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un diseño por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un diseño' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un diseño' })
  @ApiBody({ type: UpdateDisenoDto }) // Puedes crear un DTO específico para actualización si quieres
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.updated(id, body);
  }
}