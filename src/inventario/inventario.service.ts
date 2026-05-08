import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventarioService {
    constructor(private prisma: PrismaService) { }

   async createOrUpdate(data: CreateInventarioDto) {
    const sucursal = await this.prisma.sucursales.findUnique({
        where: { id: data.sucursal_id },
    });
    if (!sucursal) throw new NotFoundException('Sucursal no existe');

    let nodoId: number;
    let disenoId: number | null;

    if (sucursal.tipo?.toLowerCase() === 'matriz') {
        if (!data.diseno_id) throw new BadRequestException('Matriz requiere diseno_id');
        const diseno = await this.prisma.disenos.findUnique({
            where: { id: data.diseno_id },
            select: { nodo_id: true }
        });
        if (!diseno || diseno.nodo_id === null) throw new NotFoundException('Diseño no válido');
        disenoId = data.diseno_id;
        nodoId = diseno.nodo_id;
    } else {
        disenoId = null;
        if (data.nodo_id) {
            nodoId = data.nodo_id;
        } else if (data.diseno_id) {
            const diseno = await this.prisma.disenos.findUnique({
                where: { id: data.diseno_id },
                select: { nodo_id: true }
            });
            if (!diseno || diseno.nodo_id === null) throw new BadRequestException('Nodo no encontrado');
            nodoId = diseno.nodo_id;
        } else {
            throw new BadRequestException('Se requiere nodo_id');
        }
    }

    // Usamos el casting 'as any' en el where para evitar el error de TS
    // Prisma reconocerá 'uq_inventario_global' en tiempo de ejecución
    return this.prisma.inventario.upsert({
        where: {
            diseno_id_nodo_id_sucursal_id: {
                diseno_id: disenoId,
                nodo_id: nodoId,
                sucursal_id: data.sucursal_id,
            },
        } as any, 
        update: {
            cantidad: data.cantidad,
            stock_minimo: data.stock_minimo,
            stock_maximo: data.stock_maximo,
            actualizado_en: new Date(),
        },
        create: {
            cantidad: data.cantidad,
            stock_minimo: data.stock_minimo,
            stock_maximo: data.stock_maximo,
            sucursal_id: data.sucursal_id,
            diseno_id: disenoId,
            nodo_id: nodoId,
        },
    });
}
async findAll(user: any) {
    const { sucursal_id, rol } = user;

    // Construimos el filtro dinámico
    const where: any = {};

    // Si es VENDEDOR, solo puede ver lo de sucursal_id.
    // Si es ADMIN, sucursal_id será null o no entrará aquí, por lo que 'where' queda vacío {}
    if (rol === 'VENDEDOR') {
        where.sucursal_id = sucursal_id;
    }

    return this.prisma.inventario.findMany({
        where, // <--- Aplicamos el filtro aquí
        include: {
            disenos: true,
            nodos: true,
            sucursales: true,
        },
        // Opcional: ordenar por sucursal para que al Admin le salga agrupado
        orderBy: {
            sucursal_id: 'asc'
        }
    });
}

async lowStock(user: any) {
  const { sucursal_id, rol } = user;

  // Si es Vendedor, añadimos el filtro de sucursal al SQL
  // Si es Admin, no añadimos restricción de sucursal
  const sucursalFilter = rol === 'VENDEDOR' 
    ? this.prisma.$queryRaw`AND i.sucursal_id = ${sucursal_id}` 
    : this.prisma.$queryRaw``;

  return this.prisma.$queryRaw`
    SELECT 
      i.*, 
      d.nombre as nombre_diseno, 
      n.nombre as nombre_nodo,
      s.nombre as nombre_sucursal
    FROM inventario i
    LEFT JOIN disenos d ON i.diseno_id = d.id
    LEFT JOIN nodos n ON i.nodo_id = n.id
    LEFT JOIN sucursales s ON i.sucursal_id = s.id
    WHERE i.cantidad <= i.stock_minimo 
      AND i.activo = true
      ${sucursalFilter}
  `;
}
}