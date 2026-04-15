import { Injectable } from '@nestjs/common';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SucursalesService {

    constructor(private prisma: PrismaService) {}

    async create(data: CreateSucursalDto) {
        return this.prisma.sucursales.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.sucursales.findMany();
    }   

    async findOne(id: number) {
        return this.prisma.sucursales.findUnique({
            where: { id },
        });
    }

}
