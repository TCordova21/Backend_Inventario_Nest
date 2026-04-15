import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) { }

  create(data: CreateCategoriaDto) {
    return this.prisma.categorias.create({
      data,
    });
  }

  findAll() {
    return this.prisma.categorias.findMany();
  }

  findOne(id: number) {
    return this.prisma.categorias.findUnique({
      where: { id },
    });
  }

  findCategoriasByProducto(producto_id: number) {
    return this.prisma.categorias.findMany({
      where: { producto_id },
      orderBy: { nombre: 'asc' },
    });
  }


  update(id: number, data: UpdateCategoriaDto) {
    return this.prisma.categorias.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.categorias.delete({
      where: { id },
    });
  }
}