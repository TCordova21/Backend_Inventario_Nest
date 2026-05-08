import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNodoDto } from './dto/create-nodo.dto';
import { UpdateNodoDto } from './dto/update-nodo.dto';

@Injectable()
export class NodosService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateNodoDto) {
    return this.prisma.nodos.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        imagen: data.imagen,
        activo: data.activo ?? true,
        nodos: data.padre_id ? { connect: { id: data.padre_id } } : undefined,
      },
    });
  }

  // Filtrar para que solo devuelva nodos activos en la lista general
  async findAll() {
    return this.prisma.nodos.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { 
            other_nodos: { where: { activo: true } }, 
            disenos: { where: { activo: true } } 
          }
        }
      }
    });
  }
  
  // Filtrar hijos y diseños para que solo se vean los activos
  async findOne(id: number) {
    const nodo = await this.prisma.nodos.findUnique({
      where: { id },
      include: {
        other_nodos: {
          where: { activo: true }, 
          include: { _count: 
            { select: { other_nodos: {where: { activo: true }}, disenos: {where:{activo:true}} } }
           }
        },
        disenos: {
          where: { activo: true } // Crucial: No ver diseños "borrados"
        },    
      },
    });
    
    if (!nodo || !nodo.activo) throw new NotFoundException(`Nodo con ID ${id} no encontrado`);
    return nodo;
  }

  async update(id: number, data: UpdateNodoDto) {
    const { padre_id, ...rest } = data;

    return this.prisma.nodos.update({
      where: { id },
      data: {
        ...rest,
        nodos: padre_id ? { connect: { id: padre_id } } : undefined,
      },
    });
  }

  /**
   * Soft Delete: Transforma el borrado físico en lógico.
   * Aplica la mejor práctica de inventarios: Bloquea si hay contenido activo.
   */
  async remove(id: number) {
    // 1. Verificar si tiene contenido ACTIVO
    const nodo = await this.prisma.nodos.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            other_nodos: { where: { activo: true } }, 
            disenos: { where: { activo: true } } 
          }
        }
      }
    });

    if (!nodo) throw new NotFoundException('El nodo no existe');

    const tieneContenido = nodo._count.other_nodos > 0 || nodo._count.disenos > 0;

    if (tieneContenido) {
      throw new BadRequestException(
        'No se puede eliminar una carpeta que contiene elementos activos.'
      );
    }

    // 2. Si está vacía, hacemos el Soft Delete
    return this.prisma.nodos.update({
      where: { id },
      data: { activo: false },
    });
  }

  // Ajustar el árbol para ignorar ramas inactivas
  async getTree() {
    return this.prisma.nodos.findMany({
      where: { 
        padre_id: null,
        activo: true 
      },
      include: {
        other_nodos: {
          where: { activo: true },
          include: {
            other_nodos: { where: { activo: true } },
            disenos: { where: { activo: true } },
          }
        },
        disenos: { where: { activo: true } },
      }
    });
  }

 async findRaiz() {
  // 1. Obtenemos los nodos raíz primero (los productos base)
  const raices = await this.prisma.nodos.findMany({
    where: { padre_id: null, activo: true },
    include: {
      _count: {
        select: { other_nodos: { where: { activo: true } } }
      }
    }
  });

  // 2. Para cada raíz, contamos TODOS sus diseños en cualquier nivel de profundidad
  const raicesConTotales = await Promise.all(
    raices.map(async (nodo) => {
      // Esta consulta busca recursivamente todos los IDs de carpetas que pertenecen a este producto
      // y cuenta cuántos diseños están vinculados a esos IDs.
      const result = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(`
        WITH RECURSIVE subcarpetas AS (
            -- Caso base: el nodo raíz actual
            SELECT id FROM "nodos" WHERE id = ${nodo.id}
            UNION ALL
            -- Caso recursivo: todos los hijos de las carpetas encontradas
            SELECT n.id FROM "nodos" n
            INNER JOIN subcarpetas s ON n.padre_id = s.id
            WHERE n.activo = true
        )
        SELECT COUNT(*)::bigint as count 
        FROM "disenos" 
        WHERE nodo_id IN (SELECT id FROM subcarpetas) 
        AND activo = true;
      `);

      return {
        ...nodo,
        total_disenos: Number(result[0]?.count || 0),
      };
    }),
  );

  return raicesConTotales;
}

async getDisenosByRoot(rootId: number) {
  // 1. Obtenemos el árbol solo de ese nodo raíz
  const rootNode = await this.prisma.nodos.findUnique({
    where: { id: rootId },
    include: {
      disenos: { where: { activo: true } },
      other_nodos: {
        where: { activo: true },
        include: {
          disenos: { where: { activo: true } },
          other_nodos: {
            where: { activo: true },
            include: {
              disenos: { where: { activo: true } },
              // Puedes agregar más niveles o usar un query recursivo (CTE) si es necesario
            }
          }
        }
      }
    }
  });

  if (!rootNode) return [];

  // 2. Función para aplanar todos los diseños encontrados en la estructura
  const extraeDisenos = (nodo: any): any[] => {
    let disenos = [...(nodo.disenos || [])];
    if (nodo.other_nodos) {
      nodo.other_nodos.forEach(hijo => {
        disenos = disenos.concat(extraeDisenos(hijo));
      });
    }
    return disenos;
  };

  return extraeDisenos(rootNode);
}

async getAncestros(id: number) {
  const ancestros: { id: number; nombre: string; tipo: string; padre_id: number | null }[] = []
  let nodoActualId: number | null = id

  while (nodoActualId !== null) {
    const nodo = await this.prisma.nodos.findUnique({
      where: { id: nodoActualId },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        padre_id: true,
      },
    })

    if (!nodo) break

    ancestros.unshift(nodo)
    nodoActualId = nodo.padre_id
  }

  return ancestros
}

 
}
