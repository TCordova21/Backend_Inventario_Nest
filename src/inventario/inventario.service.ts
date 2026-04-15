import { Injectable } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventarioService {
    constructor(private prisma: PrismaService) { }

    async createOrUpdate(data: CreateInventarioDto) {
        const diseno = await this.prisma.disenos.findUnique({
            where: { id: data.diseno_id },
        })
        if (!diseno) throw new Error('Diseño no existe')

        const sucursal = await this.prisma.sucursales.findUnique({
            where: { id: data.sucursal_id },
        })
        if (!sucursal) throw new Error('Sucursal no existe')
        if (sucursal.tipo !== 'matriz') throw new Error('Solo la matriz puede ingresar stock')

        return this.prisma.inventario.upsert({
            where: {
                diseno_id_sucursal_id: {
                    diseno_id: data.diseno_id,
                    sucursal_id: data.sucursal_id,
                },
            },
            update: {
                cantidad: data.cantidad,
                stock_minimo: data.stock_minimo,
            },
            create: data,
        })
    }
    async findAll() {
        return this.prisma.inventario.findMany({
            include: {
                disenos: true,
                sucursales: true,
            },
        });
    }

    async lowStock() {
        return this.prisma.inventario.findMany({
            where: {
                cantidad: {
                    lte: this.prisma.inventario.fields.stock_minimo,
                },
            },
        });
    }

}
