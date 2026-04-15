import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubcategoriaDto } from './dto/create-subcategorias.dto';

@Injectable()
export class SubcategoriasService {

    constructor(private prisma: PrismaService) {}

async create(data: CreateSubcategoriaDto) {
  const categoria = await this.prisma.categorias.findUnique({
    where: { id: data.categoria_id },
  });

  if (!categoria) {
    throw new Error('Categoría no existe');
  }

  return this.prisma.subcategorias.create({
    data,
  });
}

async findAll() {
  return this.prisma.subcategorias.findMany({
    include: {
      categorias: true,
    },
  });
}

async findByCategoria(categoriaId: number) {
  return this.prisma.subcategorias.findMany({
    where: {
      categoria_id: categoriaId,
    },
  });
}

}
