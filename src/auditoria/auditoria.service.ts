import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditoriaService {

    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.auditoria.findMany({
            orderBy: {
                fecha: 'desc',
            },
        });
    }
    
}
