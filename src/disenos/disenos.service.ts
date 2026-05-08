import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisenoDto } from './dto/create-diseno.dto';

@Injectable()
export class DisenosService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDisenoDto) {
    const { nodo_id, ...rest } = data;
    
    const nodoExiste = await this.prisma.nodos.findUnique({ 
      where: { id: nodo_id, activo: true } // Validamos que el nodo esté activo
    });
    if (!nodoExiste) throw new NotFoundException(`El nodo con ID ${nodo_id} no existe o está inactivo`);

    return this.prisma.disenos.create({
      data: {
        ...rest,
        activo: data.activo ?? true, // Aseguramos el estado por defecto
        nodos: {
          connect: { id: nodo_id }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.disenos.findMany({
      where: { activo: true }, // Filtro global de activos
      include: {
        nodos: {
          select: { nombre: true, tipo: true }
        }
      }
    });
  }

  async findByNodo(nodoId: number) {
    return this.prisma.disenos.findMany({
      where: { 
        nodo_id: nodoId,
        activo: true // Solo diseños activos del nodo
      },
      include: {
        diseno_color: { include: { colores: true } }
      }
    });
  }

  async findOne(id: number) {
    const diseno = await this.prisma.disenos.findUnique({
      where: { id },
      include: {
        nodos: true,
        diseno_color: { include: { colores: true } }
      }
    });
    
    // Si no existe o está inactivo, lanzamos 404
    if (!diseno || !diseno.activo) {
      throw new NotFoundException(`Diseño con ID ${id} no encontrado`);
    }
    
    return diseno;
  }

  async updated(id: number, data: any) {
    // Verificamos existencia antes de actualizar
    await this.findOne(id);

    return this.prisma.disenos.update({ 
      where: { id }, 
      data 
    });
  }

  /**
   * Soft Delete para Diseño
   * No requiere validación de hijos, simplemente cambia el estado.
   */
async remove(id: number) {
    // 1. Verificamos que el diseño exista y esté activo
    await this.findOne(id);

    // 2. Verificar stock en TODAS las sucursales (Inventario)
    // Usamos aggregate para sumar la cantidad de todas las filas que coincidan con el diseno_id
    const stockTotal = await this.prisma.inventario.aggregate({
      where: { 
        diseno_id: id 
      },
      _sum: { 
        cantidad: true 
      }
    });

    const cantidadTotal = stockTotal._sum.cantidad || 0;

    // 3. Si hay stock disponible, bloqueamos la eliminación
    if (cantidadTotal > 0) {
      throw new BadRequestException(
        `No se puede eliminar. El diseño tiene ${cantidadTotal} unidades en inventario. Realiza un movimiento de BAJA o AJUSTE primero.`
      );
    }

    // 4. Si el stock es 0, procedemos con el Soft Delete
    return this.prisma.disenos.update({
      where: { id },
      data: { activo: false }
    });
  }
}