import { Injectable } from '@nestjs/common';
import { CreateVentaDto, DetalleVentaDto } from './dto/create-venta.dto';
import { PrismaService } from '../prisma/prisma.service';   

@Injectable()
export class VentasService {
    constructor(private prisma: PrismaService) {}

    async create(data: CreateVentaDto) {
  const { detalles, usuario_id, sucursal_id } = data;

  let total = 0;

  //  VALIDAR STOCK PRIMERO
  for (const item of detalles) {
    const inventario = await this.prisma.inventario.findUnique({
      where: {
        diseno_id_sucursal_id: {
          diseno_id: item.diseno_id,
          sucursal_id,
        },
      },
    });

    if (!inventario || inventario.cantidad < item.cantidad) {
      throw new Error(
        `Stock insuficiente para diseno_id ${item.diseno_id}`,
      );
    }

    total += item.cantidad * item.precio_unitario;
  }

  //  CREAR VENTA
  const venta = await this.prisma.ventas.create({
    data: {
      total,
    },
  });

  //  DETALLES + INVENTARIO + MOVIMIENTOS
  for (const item of detalles) {
    // detalle
    await this.prisma.detalle_ventas.create({
      data: {
        venta_id: venta.id,
        diseno_id: item.diseno_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      },
    });

    // descontar inventario
    await this.prisma.inventario.update({
      where: {
        diseno_id_sucursal_id: {
          diseno_id: item.diseno_id,
          sucursal_id,
        },
      },
      data: {
        cantidad: { decrement: item.cantidad },
      },
    });

    // movimiento
    await this.prisma.movimientos_inventario.create({
      data: {
        diseno_id: item.diseno_id,
        sucursal_origen_id: sucursal_id,
        tipo_movimiento: 'VENTA',
        cantidad: item.cantidad,
        usuario_id,
        referencia: `Venta ${venta.id}`,
      },
    });
  }

  return venta;
}

async findAll() {
    return this.prisma.ventas.findMany({
        include: {
            detalle_ventas: {
                include: {
                    disenos: true,
                    },
                },      
            },
        });
    
}


async findOne(id: number) {
    return this.prisma.ventas.findUnique({
        where: { id },  
        include: {
            detalle_ventas: {
                include: {
                    disenos: true,
                },      
            }
        },
    }); 

}

}
