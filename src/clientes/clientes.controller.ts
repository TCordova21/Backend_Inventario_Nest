import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateClienteDto } from './dto/create-cliente.dto';
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
  assignDiseno(@Body() body: AssignDisenoClienteDto) {
    return this.service.assignDiseno(body);
  }

  @Get(':id/disenos')
  getDisenos(@Param('id') id: string) {
    return this.service.getDisenos(Number(id));
  }
}
