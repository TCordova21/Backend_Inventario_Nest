import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasService } from './ventas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ajusta la ruta según tu proyecto
import { GetUser } from '../auth/decorators/get-user.decorator'; // Ajusta la ruta según tu proyecto

@ApiTags('Ventas')
@Controller('ventas')
@UseGuards(JwtAuthGuard) // Protegemos todas las rutas de ventas
export class VentasController {
  constructor(private readonly service: VentasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva venta' })
  @ApiResponse({ status: 201, description: 'Venta creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente o datos inválidos.' })
  create(@Body() body: CreateVentaDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener historial de ventas filtrado por rol' })
  findAll(
    @GetUser() user: any,
    @Query('sucursal_id') sucursal_id?: number 
  ) {
    // Pasamos el usuario para que el servicio decida qué registros mostrar
    return this.service.findAll(user, sucursal_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una venta específica con validación de acceso' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any
  ) {
    // El servicio validará si el usuario tiene permiso para ver esta venta específica
    return this.service.findOne(id, user);
  }

  @Patch(':id/devolucion')
  @ApiOperation({ summary: 'Procesar devolución de una venta' })
  processDevolucion(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any
  ) {
    return this.service.processDevolucion(id, user);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar una venta (Alias de devolución)' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any
  ) {
    return this.service.processDevolucion(id, user); 
  }
}