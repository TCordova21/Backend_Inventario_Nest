import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SucursalesService {
  constructor(private prisma: PrismaService) {}

  // --- Método auxiliar para validar unicidad del responsable ---
  private async validarResponsableUnico(usuario_id: number, sucursalIdActual?: number) {
    if (!usuario_id) return;

    const sucursalExistente = await this.prisma.sucursales.findFirst({
      where: {
        usuario_id: Number(usuario_id),
        activo: true,
        // Si estamos editando, ignoramos la sucursal actual
        NOT: sucursalIdActual ? { id: sucursalIdActual } : undefined,
      },
    });

    if (sucursalExistente) {
      throw new BadRequestException(
        `El usuario seleccionado ya es responsable del local: "${sucursalExistente.nombre}". Un usuario no puede estar a cargo de más de una sucursal activa.`,
      );
    }
  }

  async create(data: CreateSucursalDto) {
    const { usuario_id, ...sucursalData } = data;

    // Validar antes de crear
    if (usuario_id) {
      await this.validarResponsableUnico(Number(usuario_id));
    }

    try {
      return await this.prisma.sucursales.create({
        data: {
          ...sucursalData,
          ...(usuario_id
            ? { usuarios: { connect: { id: Number(usuario_id) } } }
            : {}),
        },
      });
    } catch (error) {
      // Doble seguridad por si falla la validación manual (error de restricción única en DB)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Este responsable ya está asignado a otra sucursal.');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.sucursales.findMany({
      where: { activo: true },
      include: {
        usuarios: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const sucursal = await this.prisma.sucursales.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });

    if (!sucursal || !sucursal.activo) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }

    return sucursal;
  }

  async update(id: number, data: UpdateSucursalDto) {
    // 1. Verificar que la sucursal existe
    await this.findOne(id);

    const { usuario_id, ...updateData } = data;

    // 2. Validar que el nuevo responsable no esté ocupado en otra sucursal
    if (usuario_id) {
      await this.validarResponsableUnico(Number(usuario_id), id);
    }

    try {
      return await this.prisma.sucursales.update({
        where: { id },
        data: {
          ...updateData,
          usuarios: usuario_id
            ? { connect: { id: Number(usuario_id) } }
            : { disconnect: true }, // Permite quitar al responsable si se desea
        },
        include: {
          usuarios: {
            select: { id: true, nombre: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('El responsable seleccionado ya tiene otra sucursal asignada.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    const stockTotal = await this.prisma.inventario.aggregate({
      where: { sucursal_id: id },
      _sum: { cantidad: true },
    });

    const cantidadTotal = stockTotal._sum.cantidad || 0;

    if (cantidadTotal > 0) {
      throw new BadRequestException(
        `No se puede eliminar la sucursal. Actualmente cuenta con ${cantidadTotal} unidades en su inventario. Debes trasladar o ajustar el stock antes de proceder.`,
      );
    }

    return this.prisma.sucursales.update({
      where: { id },
      data: { activo: false },
    });
  }
}