import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,UseGuards
} from '@nestjs/common';
import { NodosService } from './nodos.service';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateNodoDto } from './dto/create-nodo.dto';
import { UpdateNodoDto } from './dto/update-nodo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard'

@ApiTags('Nodos')
@Controller('nodos')
export class NodosController {
  constructor(private readonly service: NodosService) {}

  @Post()
   @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un producto raíz o un contenedor' })
  @ApiBody({ type: CreateNodoDto })
  create(@Body() body: CreateNodoDto) {
    return this.service.create(body);
  }

  @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.VENDEDOR)
  @ApiOperation({ summary: 'Listar todos los nodos' })
  findAll() {
    return this.service.findRaiz();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Obtener la estructura jerárquica completa' })
  getTree() {
    return this.service.getTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un nodo por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar nombre, imagen o ubicación de un nodo' })
  @ApiBody({ type: UpdateNodoDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateNodoDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un nodo (esto borrará sus hijos por el CASCADE)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get(':id/disenos-flaten')
  async getDisenosFlaten(@Param('id', ParseIntPipe) id: number) {
    return this.service.getDisenosByRoot(id);
  }
  
  @Get(':id/ancestros')
getAncestros(@Param('id') id: string) {
  return this.service.getAncestros(+id)
}
}