import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AssignDisenoClienteDto } from './dto/assign-diseno-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateClienteDto) {
  return this.prisma.clientes.create({
    data,
  });
}

    async findAll() {   
    return this.prisma.clientes.findMany();
  }

  async findOne(id: number) {
  return this.prisma.clientes.findUnique({
    where: { id },
    include: {
      diseno_cliente: {
        include: {
          disenos: true,
        },
      },
    },
  });
}

async assignDiseno(data: AssignDisenoClienteDto) {
  const { cliente_id, diseno_id } = data;

  // validar existencia
  const cliente = await this.prisma.clientes.findUnique({
    where: { id: cliente_id },
  });

  if (!cliente) throw new Error('Cliente no existe');

  const diseno = await this.prisma.disenos.findUnique({
    where: { id: diseno_id },
  });

  if (!diseno) throw new Error('Diseño no existe');

  // evitar duplicados
  const exists = await this.prisma.diseno_cliente.findUnique({
    where: {
      diseno_id_cliente_id: {
        diseno_id,
        cliente_id,
      },
    },
  });

  if (exists) {
    throw new Error('Relación ya existe');
  }

  return this.prisma.diseno_cliente.create({
    data,
  });
}

async getDisenos(cliente_id: number) {
  return this.prisma.diseno_cliente.findMany({
    where: { cliente_id },
    include: {
      disenos: {
        include: {
          diseno_color: {
            include: { colores: true },
          },
        },
      }
    

    },
  });
}

}
