import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VentasService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateVentaDto) {
    const { detalles, usuario_id, sucursal_id } = data;

    const sucursal = await this.prisma.sucursales.findUnique({
      where: { id: sucursal_id },
    });
    if (!sucursal) throw new NotFoundException('Sucursal no encontrada');

    return this.prisma.$transaction(async (tx) => {
      let totalVenta = 0;

      // --- PASO 1: VALIDACIÓN Y CÁLCULO ---
      for (const item of detalles) {
        const stockActual = await tx.inventario.findFirst({
          where: {
            nodo_id: item.nodo_id,
            sucursal_id: sucursal_id,
            diseno_id: null,
          },
        });

        if (!stockActual || stockActual.cantidad < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente. Disponible: ${stockActual?.cantidad || 0}`);
        }
        totalVenta += item.cantidad * item.precio_unitario;
      }

      // --- PASO 2: CABECERA ---
      const venta = await tx.ventas.create({
        data: {
          total: totalVenta,
          sucursal_id,
          usuario_id,
          estado: 'COMPLETADA'
        },
      });

      // --- PASO 3: DETALLES, STOCK Y KARDEX ---
      for (const item of detalles) {
        const inv = await tx.inventario.findFirst({
          where: { nodo_id: item.nodo_id, sucursal_id, diseno_id: null },
        });

        await tx.detalle_ventas.create({
          data: {
            venta_id: venta.id,
            nodo_id: item.nodo_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          },
        });
        
        if (!inv) {
          throw new NotFoundException(
            `No existe registro de inventario para el producto ${item.nodo_id} en esta sucursal.`
          );
        }
        await tx.inventario.update({
          where: { id: inv.id },
          data: {
            cantidad: { decrement: item.cantidad },
            actualizado_en: new Date()
          },
        });

        await tx.movimientos_inventario.create({
          data: {
            nodo_id: item.nodo_id,
            sucursal_origen_id: sucursal_id,
            tipo_movimiento: 'VENTA',
            cantidad: item.cantidad,
            usuario_id,
            referencia: `Venta #${venta.id}`,
            estado: 'COMPLETADO',
          },
        });
      }
      return venta;
    });
  }

  async processDevolucion(id: number, user: any) { // Añadido parámetro user
    const venta = await this.prisma.ventas.findUnique({
      where: { id },
      include: { detalle_ventas: true }
    });

    if (!venta) throw new NotFoundException('Venta no encontrada');
    
    // Seguridad: El vendedor solo devuelve ventas de su sucursal
    if (user.rol !== 'ADMIN' && venta.sucursal_id !== user.sucursal_id) {
      throw new ForbiddenException('No tienes permiso para devolver esta venta');
    }

    if (venta.estado !== 'COMPLETADA') {
      throw new BadRequestException(`No se puede devolver una venta en estado ${venta.estado}`);
    }

    return this.prisma.$transaction(async (tx) => {
      for (const detalle of venta.detalle_ventas) {
        const inv = await tx.inventario.findFirst({
          where: {
            nodo_id: detalle.nodo_id,
            sucursal_id: venta.sucursal_id,
            diseno_id: null
          }
        });

        if (inv) {
          await tx.inventario.update({
            where: { id: inv.id },
            data: {
              cantidad: { increment: detalle.cantidad },
              actualizado_en: new Date()
            }
          });

          await tx.movimientos_inventario.create({
            data: {
              nodo_id: detalle.nodo_id,
              sucursal_destino_id: venta.sucursal_id,
              tipo_movimiento: 'DEVOLUCION',
              cantidad: detalle.cantidad,
              usuario_id: user.id, // Registramos quién hace la devolución
              referencia: `Devolución de Venta #${venta.id}`,
              estado: 'COMPLETADO',
            }
          });
        }
      }

      return tx.ventas.update({
        where: { id },
        data: { estado: 'DEVUELTA' }
      });
    });
  }

  async findOne(id: number, user: any) { // Añadido parámetro user
    const venta = await this.prisma.ventas.findUnique({
      where: { id },
      include: {
        sucursales: true,
        usuarios: { select: { nombre: true, email: true } },
        detalle_ventas: {
          include: {
            disenos: { select: { nombre: true, codigo: true } },
            nodos: { select: { nombre: true } }
          }
        }
      }
    });
    if (!venta) throw new NotFoundException(`Venta #${id} no encontrada`);
    
    // Seguridad: El vendedor solo ve sus ventas
    if (user.rol !== 'ADMIN' && venta.sucursal_id !== user.sucursal_id) {
      throw new ForbiddenException('Acceso denegado a esta venta');
    }

    return venta;
  }

  async findAll(user: any, filterSucursalId?: number) { // Añadido parámetro user y filtro opcional
    const { sucursal_id, rol } = user;
    
    // Si es VENDEDOR, forzamos sucursal. Si es ADMIN, usamos el filtro si existe.
    const targetSucursalId = rol === 'ADMIN' ? filterSucursalId : sucursal_id;

    return this.prisma.ventas.findMany({
      where: {
        sucursal_id: targetSucursalId ? Number(targetSucursalId) : undefined
      },
      orderBy: { fecha: 'desc' },
      include: {
        sucursales: true,
        usuarios: { select: { nombre: true } }
      }
    });
  }
}