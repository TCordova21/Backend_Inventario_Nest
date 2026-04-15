import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.productos.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.productos.findMany();
  }

  async findOne(id: number) {
    return this.prisma.productos.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: CreateProductDto) {
    return this.prisma.productos.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.productos.delete({
      where: { id },
    });
  }


}