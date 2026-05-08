import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MovimientosService {
  constructor(private prisma: PrismaService) { }
  private readonly logger = new Logger(MovimientosService.name); // Instancia de Logger

  async create(data: CreateMovimientoDto) {
    const {
      diseno_id,
      nodo_id,
      sucursal_origen_id,
      sucursal_destino_id,
      tipo_movimiento,
      cantidad,
      usuario_id,
      referencia,
      observacion,
    } = data;

    const dbDisenoId = diseno_id ?? null;
    let effectiveNodoId = nodo_id;

    // Si no viene nodo_id, lo recuperamos del diseño
    if (!effectiveNodoId && diseno_id) {
      const d = await this.prisma.disenos.findUnique({
        where: { id: diseno_id },
        select: { nodo_id: true }
      });
      effectiveNodoId = d?.nodo_id ?? undefined;
    }

    if (!effectiveNodoId) throw new BadRequestException('Nodo no encontrado o no especificado');

    try {
      return await this.prisma.$transaction(async (tx) => {

        // --- PASO A: ORIGEN (SALIDA DE STOCK) ---
        const movimientosDeSalida = ['TRASLADO', 'RETORNO_MATRIZ', 'VENTA', 'SALIDA'];

        if (sucursal_origen_id && movimientosDeSalida.includes(tipo_movimiento)) {
          const sucursalOrigen = await tx.sucursales.findUnique({ where: { id: sucursal_origen_id } });
          const esOrigenLocal = sucursalOrigen?.tipo?.toLowerCase() === 'local';

          // Para restar stock: Si es local usamos Raíz, si es Matriz usamos el nodo específico
          const nodoBusquedaOrigen = esOrigenLocal 
            ? await this.findNodoRaizWithTx(tx, effectiveNodoId!) 
            : effectiveNodoId;

          const invOrigen = await tx.inventario.findFirst({
            where: {
              sucursal_id: sucursal_origen_id,
              nodo_id: nodoBusquedaOrigen,
              diseno_id: esOrigenLocal ? null : dbDisenoId, 
            },
          });

          if (!invOrigen || invOrigen.cantidad < cantidad) {
            throw new BadRequestException(`Stock insuficiente en origen. Disponible: ${invOrigen?.cantidad || 0}`);
          }

          await tx.inventario.update({
            where: { id: invOrigen.id },
            data: { cantidad: { decrement: cantidad } },
          });
        }

        // --- PASO B: DESTINO (ENTRADA DE STOCK O PENDIENTE) ---
        const requiereConfirmacion = tipo_movimiento === 'TRASLADO' || tipo_movimiento === 'RETORNO_MATRIZ';
        let stockAnteriorParaAjuste: number | null = null;

        if (tipo_movimiento === 'AJUSTE') {
          // Ajuste siempre es sobre el nodo específico y diseño específico
          const invAjuste = await tx.inventario.findFirst({
            where: { sucursal_id: sucursal_origen_id, nodo_id: effectiveNodoId, diseno_id: dbDisenoId },
          });
          stockAnteriorParaAjuste = invAjuste ? Number(invAjuste.cantidad) : 0;

          if (invAjuste) {
            await tx.inventario.update({ where: { id: invAjuste.id }, data: { cantidad: cantidad } });
          } else {
            await tx.inventario.create({
              data: { sucursal_id: sucursal_origen_id!, nodo_id: effectiveNodoId!, diseno_id: dbDisenoId, cantidad },
            });
          }
        } else if (sucursal_destino_id && !requiereConfirmacion) {
          // ENTRADA INMEDIATA (Ej: Compras)
          const sucursalDestino = await tx.sucursales.findUnique({ where: { id: sucursal_destino_id } });
          const esLocalDestino = sucursalDestino?.tipo?.toLowerCase() === 'local';

          const searchParamsDestino = {
            sucursal_id: sucursal_destino_id,
            diseno_id: esLocalDestino ? null : dbDisenoId,
            nodo_id: esLocalDestino ? await this.findNodoRaizWithTx(tx, effectiveNodoId!) : effectiveNodoId,
          };

          const invDestino = await tx.inventario.findFirst({ where: searchParamsDestino });

          if (invDestino) {
            await tx.inventario.update({ where: { id: invDestino.id }, data: { cantidad: { increment: cantidad } } });
          } else {
            await tx.inventario.create({ data: { ...searchParamsDestino, cantidad } });
          }
        }

        // --- PASO C: REGISTRO DEL MOVIMIENTO ---
        const nuevoEstado = requiereConfirmacion ? 'PENDIENTE' : 'COMPLETADO';

        return await tx.movimientos_inventario.create({
          data: {
            diseno_id: dbDisenoId,
            nodo_id: effectiveNodoId!,
            sucursal_origen_id,
            sucursal_destino_id: tipo_movimiento === 'AJUSTE' ? sucursal_origen_id : sucursal_destino_id,
            tipo_movimiento,
            cantidad,
            usuario_id,
            referencia,
            observacion,
            estado: nuevoEstado,
            fecha: new Date(),
            cantidad_confirmada: tipo_movimiento === 'AJUSTE' ? stockAnteriorParaAjuste : null,
            fecha_confirmacion: tipo_movimiento === 'AJUSTE' ? new Date() : null,
          },
        });
      }, { maxWait: 5000, timeout: 15000 });

    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message || 'Error en el proceso de inventario');
    }
  }

  async confirmarMovimiento(id: number, data: any) {

    this.logger.log(`Iniciando confirmación para ID: ${id}`);
    this.logger.debug(`Datos recibidos: ${JSON.stringify(data)}`);

    const cantidadConfirmada = Number(data.cantidad_confirmada?.cantidad_confirmada ?? data.cantidad_confirmada);
    const usuarioConfirmacionId = Number(data.usuario_confirmacion_id);



    if (isNaN(cantidadConfirmada)) throw new BadRequestException('Cantidad no válida');
    if (!usuarioConfirmacionId) throw new BadRequestException('El ID del usuario de confirmación es requerido');{
      this.logger.error('ID de usuario de confirmación ausente en el body');
    }

    return await this.prisma.$transaction(async (tx) => {
      const movimiento = await tx.movimientos_inventario.findUnique({
        where: { id },
        include: { 
          sucursales_movimientos_inventario_sucursal_destino_idTosucursales: true,
          disenos: true // Incluimos diseño para estar seguros del nodo_id original
        }
      });

      if (!movimiento || movimiento.estado !== 'PENDIENTE') {
        throw new BadRequestException('El movimiento no existe o ya ha sido procesado');
      }

      const sucursalDestino = movimiento.sucursales_movimientos_inventario_sucursal_destino_idTosucursales;
      const esLocalDestino = sucursalDestino?.tipo?.toLowerCase() === 'local';
      
      // LÓGICA CLAVE: 
      // Si va a MATRIZ, usamos el nodo original del diseño (ej: 39 - Anime)
      // Si va a LOCAL, usamos el nodo raíz (ej: 4 - Peluches)
      const targetDisenoId = esLocalDestino ? null : movimiento.diseno_id;
      let targetNodoId = movimiento.nodo_id!;

      if (esLocalDestino) {
        targetNodoId = await this.findNodoRaizWithTx(tx, movimiento.nodo_id!);
      } else {
        // En retornos a matriz, nos aseguramos de usar el nodo_id que tiene el diseño asignado
        // para que caiga en la misma "carpeta" de la entrada original.
        targetNodoId = movimiento.disenos?.nodo_id || movimiento.nodo_id!;
      }

      const invDestino = await tx.inventario.findFirst({
        where: {
          sucursal_id: movimiento.sucursal_destino_id!,
          diseno_id: targetDisenoId,
          nodo_id: targetNodoId,
        },
      });

      if (invDestino) {
        await tx.inventario.update({
          where: { id: invDestino.id },
          data: { cantidad: { increment: cantidadConfirmada } },
        });
      } else {
        // Si no existe (no debería pasar en matriz según tu lógica), se crea con los IDs específicos
        await tx.inventario.create({
          data: {
            sucursal_id: movimiento.sucursal_destino_id!,
            diseno_id: targetDisenoId,
            nodo_id: targetNodoId,
            cantidad: cantidadConfirmada,
          },
        });
      }
    this.logger.log("Funciona jajajaja" + usuarioConfirmacionId)
      return await tx.movimientos_inventario.update({
        where: { id },
        data: {
          estado: 'COMPLETADO',
          cantidad_confirmada: cantidadConfirmada,
          fecha_confirmacion: new Date(),
          usuario_confirmacion_id: usuarioConfirmacionId,
          
        },
      });
      
    });
  }

  // --- MÉTODOS DE APOYO ---

  private async findNodoRaizWithTx(tx: any, nodoId: number): Promise<number> {
    let currentNodo = await tx.nodos.findUnique({
      where: { id: nodoId },
      select: { id: true, padre_id: true }
    });
    while (currentNodo && currentNodo.padre_id) {
      const padre = await tx.nodos.findUnique({
        where: { id: currentNodo.padre_id },
        select: { id: true, padre_id: true }
      });
      if (!padre) break;
      currentNodo = padre;
    }
    return currentNodo!.id;
  }

  // ... (Resto de métodos findPendientesBySucursal, findAll, findOne se mantienen igual)
  async findPendientesBySucursal(sucursalId: number) {
    return await this.prisma.movimientos_inventario.findMany({
      where: { sucursal_destino_id: sucursalId, estado: 'PENDIENTE' },
      include: {
        disenos: { select: { nombre: true, codigo: true } },
        sucursales_movimientos_inventario_sucursal_origen_idTosucursales: { select: { nombre: true } },
        usuarios: { select: { nombre: true } }
        
      },
      orderBy: { fecha: 'desc' }
    });
  }
async getAllPendientes() {
  return this.prisma.movimientos_inventario.findMany({
    where: { estado: 'PENDIENTE' },
    include: {
      disenos: { select: { id: true, nombre: true, imagen: true } },
      nodos: { select: { id: true, nombre: true } },
      sucursales_movimientos_inventario_sucursal_origen_idTosucursales: {
        select: { nombre: true }
      },
      sucursales_movimientos_inventario_sucursal_destino_idTosucursales: {
        select: { nombre: true }
      },
    },
    orderBy: { fecha: 'desc' },
  })
}
 // movimientos.service.ts

async findAll(user: any, filters: { tipo?: string; desde?: string; hasta?: string; sucursal_id?: number }) {
  const { sucursal_id: userSucursalId, rol } = user;
  const { tipo, desde, hasta, sucursal_id: filterSucursalId } = filters;

  // Definimos qué sucursal filtrar
  // 1. Si es VENDEDOR, ignoramos cualquier filtro externo y forzamos su propia sucursal.
  // 2. Si es ADMIN, usamos el filtro de sucursal que venga por parámetro (si existe).
  const targetSucursalId = rol === 'ADMIN' ? filterSucursalId : userSucursalId;

  const where: any = {
    tipo_movimiento: tipo,
    fecha: (desde || hasta) ? {
      gte: desde ? new Date(desde) : undefined,
      lte: hasta ? new Date(hasta) : undefined,
    } : undefined,
  };

  // Si hay una sucursal objetivo (porque es Vendedor o porque el Admin filtró una)
  // Aplicamos el OR para ver movimientos de salida O de entrada de esa sucursal
  if (targetSucursalId) {
    where.OR = [
      { sucursal_origen_id: Number(targetSucursalId) },
      { sucursal_destino_id: Number(targetSucursalId) }
    ];
  }

  return await this.prisma.movimientos_inventario.findMany({
    where,
    include: {
      disenos: { select: { nombre: true, codigo: true, imagen: true } },
      nodos: { select: { nombre: true, imagen: true } },
      sucursales_movimientos_inventario_sucursal_origen_idTosucursales: { select: { nombre: true } },
      sucursales_movimientos_inventario_sucursal_destino_idTosucursales: { select: { nombre: true } },
      usuarios: { select: { nombre: true } },
      usuarios_movimientos_inventario_usuario_confirmacion_idTousuarios: { select: { nombre: true } }
    },
    orderBy: { fecha: 'desc' },
  });
}
  async findOne(id: number) {
    const movimiento = await this.prisma.movimientos_inventario.findUnique({
      where: { id },
      include: {
        disenos: { select: { nombre: true, codigo: true } },
        nodos: { select: { nombre: true } },
        sucursales_movimientos_inventario_sucursal_origen_idTosucursales: { select: { nombre: true, tipo: true } },
        sucursales_movimientos_inventario_sucursal_destino_idTosucursales: { select: { nombre: true, tipo: true } },
        usuarios: { select: { nombre: true, apellido: true, email: true } },
      
      }
    });
    if (!movimiento) throw new BadRequestException('El movimiento solicitado no existe');
    return movimiento;
  }
}