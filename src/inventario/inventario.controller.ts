import { Controller, Get, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { InventarioService } from './inventario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard'

@ApiTags('Inventario')
@Controller('inventario')
export class InventarioController {
  constructor(private readonly service: InventarioService) { }

  @Post()
  @ApiOperation({
    summary: 'Crear o actualizar stock',
    description: 'Si es Matriz usa diseno_id. Si es Local, usa nodo_id para stock global.'
  })
  @ApiResponse({ status: 201, description: 'Stock procesado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o falta de IDs obligatorios.' })
  @UsePipes(new ValidationPipe({ transform: true }))
  createOrUpdate(@Body() body: CreateInventarioDto) {
    return this.service.createOrUpdate(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener todo el inventario' })
  findAll(@GetUser() user: any) {
    return this.service.findAll(user);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDEDOR)
  @ApiOperation({ summary: 'Listar productos con stock bajo el mínimo filtrado' })
  lowStock(@GetUser() user: any) {
    return this.service.lowStock(user);
  }
}


