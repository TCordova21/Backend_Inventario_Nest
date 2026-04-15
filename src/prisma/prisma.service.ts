import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });

    const base = new PrismaClient({ adapter });

    // 🔥 EXTENSIÓN DE AUDITORÍA
    const extended = base.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const result = await query(args);

            const auditables = ['create', 'update', 'delete'];

            if (!auditables.includes(operation)) {
              return result;
            }

            try {
              await base.auditoria.create({
                data: {
                  tabla: model ?? 'unknown',
                  accion: operation.toUpperCase(),
                  registro_id: (result && typeof result === 'object' && 'id' in result) ? result.id : null,
                  datos_antes:
                    operation === 'update' || operation === 'delete'
                      ? JSON.stringify(args?.where ?? {})
                      : JSON.stringify({}),
                  datos_despues:
                    operation === 'create' || operation === 'update'
                      ? JSON.stringify(result)
                      : JSON.stringify({}),
                  usuario_id: null, // luego lo conectamos con auth
                },
              });
            } catch (error) {
              console.error('Error auditoría:', error);
            }

            return result;
          },
        },
      },
    });

    // 🔥 IMPORTANTE: reasignar THIS
    super({ adapter });
    Object.assign(this, extended);
  }

  async onModuleInit() {
    await this.$connect();
  }
}