import { Injectable } from '@nestjs/common';
import { CreateDisenoColorDto } from './dto/create-diseno-color.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisenoColorService {

    constructor(private prisma: PrismaService) { }

    async create(data: CreateDisenoColorDto) {
        // 1. Validar diseño
        const diseno = await this.prisma.disenos.findUnique({
            where: { id: data.diseno_id },
        });

        if (!diseno) {
            throw new Error('Diseño no existe');
        }

        // 2. Validar color
        const color = await this.prisma.colores.findUnique({
            where: { id: data.color_id },
        });

        if (!color) {
            throw new Error('Color no existe');
        }

        // 3. Evitar duplicados
        const exists = await this.prisma.diseno_color.findUnique({
            where: {
                diseno_id_color_id: {
                    diseno_id: data.diseno_id,
                    color_id: data.color_id,
                },
            },
        });

        if (exists) {
            throw new Error('Esta combinación ya existe');
        }

        // 4. Crear
        return this.prisma.diseno_color.create({
            data,
            include: {
                disenos: true,
                colores: true,
            },
        });
    }

    async findAll() {
        return this.prisma.diseno_color.findMany({
            include: {
                disenos: true,
                colores: true,
            },
        });
    }

    async findByDiseno(disenoId: number) {
        return this.prisma.diseno_color.findMany({
            where: {
                diseno_id: disenoId,
            },
            include: {
                colores: true,
            },
        });
    }

    async delete(id: number) {
        return this.prisma.diseno_color.delete({
            where: { id },
        });
    }
    

  

}
