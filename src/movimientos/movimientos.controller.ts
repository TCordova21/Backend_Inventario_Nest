import { Controller, Post, Body, Get, Query, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { MovimientosService } from './movimientos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard'
import { Public } from '../auth/decorators/public.decorator';


@ApiTags('Movimientos')
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly service: MovimientosService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo movimiento de inventario (Entradas, Ajustes, Traslados, Retornos)' })
  create(@Body() body: CreateMovimientoDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar movimientos con filtros' })
  @ApiQuery({ name: 'sucursal_id', required: false, type: Number })
  @ApiQuery({ name: 'tipo', required: false, description: 'Ej: ENTRADA, AJUSTE, TRASLADO, RETORNO_MATRIZ' })
  @ApiQuery({ name: 'desde', required: false, description: 'Formato YYYY-MM-DD' })
  @ApiQuery({ name: 'hasta', required: false, description: 'Formato YYYY-MM-DD' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDEDOR)
  
  @ApiOperation({ summary: 'Obtener movimientos filtrados por rol y sucursal' })
  findAll(
    @GetUser() user: any,
    @Query('sucursal_id') sucursal_id?: number,
    @Query('tipo') tipo?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll(user, { sucursal_id, tipo, desde, hasta });
  }
@Get('pendientes')
getAllPendientes() {
  return this.service.getAllPendientes()
}

  @Get('pendientes/:sucursal_id')

  @ApiOperation({ summary: 'Listar movimientos pendientes de confirmar para una sucursal destino' })
  findPendientes(@Param('sucursal_id', ParseIntPipe) sucursal_id: number) {
    return this.service.findPendientesBySucursal(sucursal_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un movimiento específico' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    // Nota: Asegúrate de que el método findOne exista en tu service (lo incluimos en el paso anterior)
    return this.service.findOne(id);
  }

  @Patch(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar la recepción de un traslado o retorno a matriz' })
  async confirmar(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      cantidad_confirmada: number;
      usuario_confirmacion_id: number;
      fecha_confirmacion?: string
    }
  ) {
    // Verificamos qué llega al controlador antes de mandarlo al servicio
    // console.log('Payload en Controlador:', data); 

    return await this.service.confirmarMovimiento(id, data);
  }
}