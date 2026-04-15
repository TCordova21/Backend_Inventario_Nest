import { Injectable } from '@nestjs/common';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { PrismaService } from '../prisma/prisma.service';   

@Injectable()
export class MovimientosService {

    constructor(private prisma: PrismaService) {}

    async create(data: CreateMovimientoDto) {
  const {
    diseno_id,
    sucursal_origen_id,
    sucursal_destino_id,
    tipo_movimiento,
    cantidad,
  } = data;

  if (cantidad <= 0) {
    throw new Error('Cantidad debe ser mayor a 0');
  }

  // 🔥 CASO 1: INGRESO
  if (tipo_movimiento === 'INGRESO') {
    await this.prisma.inventario.upsert({
      where: {
        diseno_id_sucursal_id: {
          diseno_id,
          sucursal_id: sucursal_destino_id!,
        },
      },
      update: {
        cantidad: { increment: cantidad },
      },
      create: {
        diseno_id,
        sucursal_id: sucursal_destino_id!,
        cantidad,
      },
    });
  }

  // 🔥 CASO 2: VENTA
  if (tipo_movimiento === 'VENTA') {
    const inventario = await this.prisma.inventario.findUnique({
      where: {
        diseno_id_sucursal_id: {
          diseno_id,
          sucursal_id: sucursal_origen_id!,
        },
      },
    });

    if (!inventario || inventario.cantidad < cantidad) {
      throw new Error('Stock insuficiente');
    }

    await this.prisma.inventario.update({
      where: {
        diseno_id_sucursal_id: {
          diseno_id,
          sucursal_id: sucursal_origen_id!,
        },
      },
      data: {
        cantidad: { decrement: cantidad },
      },
    });
  }

  // 🔥 CASO 3: TRASLADO
  if (tipo_movimiento === 'TRASLADO') {
    // descontar origen
    await this.prisma.inventario.update({
      where: {
        diseno_id_sucursal_id: {
          diseno_id,
          sucursal_id: sucursal_origen_id!,
        },
      },
      data: {
        cantidad: { decrement: cantidad },
      },
    });

    // sumar destino
    await this.prisma.inventario.upsert({
      where: {
        diseno_id_sucursal_id: {
          diseno_id,
          sucursal_id: sucursal_destino_id!,
        },
      },
      update: {
        cantidad: { increment: cantidad },
      },
      create: {
        diseno_id,
        sucursal_id: sucursal_destino_id!,
        cantidad,
      },
    });
  }

  // 🔥 GUARDAR MOVIMIENTO
  return this.prisma.movimientos_inventario.create({
    data,
  });
}

async findAll() {
  return this.prisma.movimientos_inventario.findMany({
    include: {
      disenos: true,
    },
  });   
}

}
