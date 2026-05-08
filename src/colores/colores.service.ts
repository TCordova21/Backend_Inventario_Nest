import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColoresService {
  constructor(private prisma: PrismaService) {}

 async create(data: CreateColorDto) {
  // 1. Buscar si el color ya existe (sin importar si está activo o no)
  const existingColor = await this.prisma.colores.findFirst({
    where: {
      OR: [
        { nombre: data.nombre },
        { codigo_hex: data.codigo_hex }
      ],
    },
  });

  if (existingColor) {
    // 2. Si existe y está activo, lanzamos el error de siempre
    if (existingColor.activo) {
      throw new BadRequestException('El nombre o código hexadecimal ya está en uso');
    }

    // 3. Si existe pero está INACTIVO, lo reactivamos y actualizamos sus datos
    // Esto evita el error del @unique de la base de datos
    return this.prisma.colores.update({
      where: { id: existingColor.id },
      data: {
        ...data,
        activo: true,
      },
    });
  }

  // 4. Si no existe en absoluto, lo creamos normalmente
  return this.prisma.colores.create({
    data: {
      ...data,
      activo: true,
    },
  });
}

  // Solo devuelve colores activos para el catálogo
  async findAll() {
    return this.prisma.colores.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });
  }

  // Buscador filtrado por activos
  async findByNombre(nombre: string) {
    return this.prisma.colores.findMany({
      where: {
        activo: true,
        OR: [
          { nombre: { contains: nombre, mode: 'insensitive' } },
          { codigo_hex: { contains: nombre, mode: 'insensitive' } }
        ]
      },
    });
  }

  async updated(id: number, data: UpdateColorDto) {
    return this.prisma.colores.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft Delete: Ya no usamos .delete() para evitar errores de integridad
   * con la tabla de Diseños.
   */
  async remove(id: number) {
    // 1. Verificar si existe
    const color = await this.prisma.colores.findUnique({ where: { id } });
    if (!color) throw new NotFoundException('El color no existe');

    // 2. Borrado lógico: Simplemente lo desactivamos
    return this.prisma.colores.update({
      where: { id },
      data: { activo: false },
    });
  }
}