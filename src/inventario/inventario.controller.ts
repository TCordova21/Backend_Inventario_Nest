import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { InventarioService } from './inventario.service';

@ApiTags('Inventario')
@Controller('inventario')
export class InventarioController {
  constructor(private readonly service: InventarioService) {}

  @Post()
  createOrUpdate(@Body() body: CreateInventarioDto) {
    return this.service.createOrUpdate(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('low-stock')
  lowStock() {
    return this.service.lowStock();
  }
}