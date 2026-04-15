import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisenoDto } from './dto/create-diseno.dto';
import { UpdateDisenoDto } from './dto/update-diseno.dto';

@Injectable()
export class DisenosService {

    constructor(private prisma: PrismaService) {}

    async create(data: CreateDisenoDto) {
  const subcategoria = await this.prisma.subcategorias.findUnique({
    where: { id: data.subcategoria_id },
  });

  if (!subcategoria) {
    throw new Error('Subcategoría no existe');
  }

  return this.prisma.disenos.create({
    data,
  });
}
    async findAll() {
    return this.prisma.disenos.findMany({
        include: {
        subcategorias: true,
        },
    });

    }

    async findOne(id: number) {
    return this.prisma.disenos.findUnique({
        where: { id },  
        include: {
        subcategorias: true,
        diseno_color: true,
        },
    });
    }

    async findBySubcategoria(subcategoriaId: number) {
    return this.prisma.disenos.findMany({
        where: {
        subcategoria_id: subcategoriaId,
        },
    }); 
    }

    async update(id: number, data: UpdateDisenoDto) { // Cambiar el tipo aquí
  return this.prisma.disenos.update({
    where: { id },
    data,
  });
}


}
