import { Injectable } from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColoresService {
    constructor(private prisma: PrismaService) {}

    async create(data: CreateColorDto) {
  // evitar duplicados
  const exists = await this.prisma.colores.findFirst({
    where: {
      nombre: data.nombre,
      codigo_hex: data.codigo_hex,
    },
  });

  if (exists) {
    throw new Error('Color ya existe');
  }

  return this.prisma.colores.create({
    data,
  });
}

async findAll() {
  return this.prisma.colores.findMany();
}   

async findByNombre(nombre: string) {
  return this.prisma.colores.findMany({
    where: {
      nombre:{
        contains: nombre,
        mode: 'insensitive',
      }
    },
  });
}

async updated(id: number, data: UpdateColorDto) {
  return this.prisma.colores.update({
    where: { id },
    data,
  });
}


}
