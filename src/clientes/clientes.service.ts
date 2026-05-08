import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto'; // Asegúrate de crear este DTO
import { PrismaService } from '../prisma/prisma.service';
import { AssignDisenoClienteDto } from './dto/assign-diseno-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateClienteDto) {
    return this.prisma.clientes.create({
      data: {
        ...data,
        activo: true, // Nos aseguramos que nazca activo
      },
    });
  }

  // Modificamos findAll para que solo traiga los NO eliminados por defecto
  async findAll() {
    return this.prisma.clientes.findMany({
      where: { activo: true },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id },
      include: {
        diseno_cliente: {
          include: {
            disenos: true,
          },
        },
      },
    });

    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    return cliente;
  }

  // --- LÓGICA DE EDICIÓN ---
  async update(id: number, data: UpdateClienteDto) {
    // Validamos primero si existe
    await this.findOne(id);

    return this.prisma.clientes.update({
      where: { id },
      data,
    });
  }

  // --- LÓGICA DE SOFT DELETE ---
  async remove(id: number) {
    // Validamos existencia
    await this.findOne(id);

    // En lugar de delete, hacemos un update del campo activo
    return this.prisma.clientes.update({
      where: { id },
      data: { activo: false },
    });
  }

  // Opcional: Método para restaurar un cliente eliminado
  async restore(id: number) {
    return this.prisma.clientes.update({
      where: { id },
      data: { activo: true },
    });
  }

  async assignDiseno(data: AssignDisenoClienteDto) {
    const { cliente_id, diseno_id, exclusivo } = data;

    // 1. Validaciones de existencia
    const cliente = await this.prisma.clientes.findUnique({ where: { id: cliente_id } });
    if (!cliente || !cliente.activo) throw new NotFoundException('Cliente no encontrado o inactivo');

    const diseno = await this.prisma.disenos.findUnique({ where: { id: diseno_id } });
    if (!diseno) throw new NotFoundException('Diseño no encontrado');

    // 2. REGLA DE EXCLUSIVIDAD
    // Buscamos si este diseño ya tiene una relación marcada como exclusiva
    const asignacionExclusiva = await this.prisma.diseno_cliente.findFirst({
      where: {
        diseno_id,
        exclusivo: true
      },
      include: { clientes: true }
    });

    if (asignacionExclusiva) {
      throw new BadRequestException(
        `Este diseño es exclusivo del cliente: ${asignacionExclusiva.clientes?.nombre}`
      );
    }

    // 3. Si el usuario intenta asignar como exclusivo un diseño que ya tienen otros
    if (exclusivo) {
      const tieneAsignaciones = await this.prisma.diseno_cliente.findFirst({
        where: { diseno_id }
      });
      if (tieneAsignaciones) {
        throw new BadRequestException(
          'No se puede marcar como exclusivo porque ya está asignado a otros clientes.'
        );
      }
    }

    // 4. Upsert o Create para evitar errores de duplicado en la relación
    return this.prisma.diseno_cliente.upsert({
      where: {
        diseno_id_cliente_id: { diseno_id, cliente_id },
      },
      update: { exclusivo: exclusivo ?? false },
      create: {
        cliente_id,
        diseno_id,
        exclusivo: exclusivo ?? false,
      },
    });
  }

  // --- NUEVO MÉTODO: DESASIGNAR ---
  async unassignDiseno(cliente_id: number, diseno_id: number) {
    try {
      return await this.prisma.diseno_cliente.delete({
        where: {
          diseno_id_cliente_id: { diseno_id, cliente_id },
        },
      });
    } catch (error) {
      throw new NotFoundException('La asignación no existe o ya fue eliminada');
    }
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
        },
      },
    });
  }
}