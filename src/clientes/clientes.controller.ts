import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClientesService } from './clientes.service';
import { AssignDisenoClienteDto } from './dto/assign-diseno-cliente.dto';   


@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  @Post()
  create(@Body() body: CreateClienteDto) {
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

 @Post('assign-diseno')
  assignDiseno(@Body() data: AssignDisenoClienteDto) {
    return this.service.assignDiseno(data);
  }

  // Desasignar diseño de un cliente
  // DELETE /clientes/5/disenos/10
  @Delete(':clienteId/disenos/:disenoId')
  unassignDiseno(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Param('disenoId', ParseIntPipe) disenoId: number
  ) {
    return this.service.unassignDiseno(clienteId, disenoId);
  }

  @Get(':id/disenos')
  getDisenos(@Param('id') id: string) {
    return this.service.getDisenos(Number(id));
  }

  // --- RUTA PARA EDITAR ---
  // Usamos PATCH porque normalmente solo actualizamos algunos campos
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateClienteDto: UpdateClienteDto
  ) {
    return this.service.update(id, updateClienteDto);
  }

  // --- RUTA PARA SOFT DELETE ---
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
