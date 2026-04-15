import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {

    constructor(private prisma: PrismaService) { }

    async create(data: CreateUsuarioDto) {
        const role = await this.prisma.roles.findUnique({
            where: { id: data.rol_id },
        });

        if (!role) {
            throw new Error('Rol no existe');
        }

        const exists = await this.prisma.usuarios.findUnique({
            where: { email: data.email },
        });

        if (exists) {
            throw new Error('Email ya registrado');
        }

        return this.prisma.usuarios.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.usuarios.findMany({
            include: {
                roles: true,
            },
        });

    }

    async findOne(id: number) {
        return this.prisma.usuarios.findUnique({
            where: { id },
            include: {
                roles: true,
            },
        });
    }

    async update(id: number, data: UpdateUsuarioDto) {
        return this.prisma.usuarios.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        return this.prisma.usuarios.delete({
            where: { id },
        });

    }

}
