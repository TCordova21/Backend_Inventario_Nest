import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { MovimientosService } from './movimientos.service'; 

@ApiTags('Movimientos')
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly service: MovimientosService) {}

  @Post()
  create(@Body() body: CreateMovimientoDto) {
    return this.service.create(body);
  }

  @Get()  
  findAll() {
    return this.service.findAll();
  }

}