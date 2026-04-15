import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasService } from './ventas.service';

@ApiTags('Ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly service: VentasService) {}

  @Post()
  create(@Body() body: CreateVentaDto) {
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
}
