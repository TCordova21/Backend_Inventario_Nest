import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {

  constructor(private prisma: PrismaService) {}

  async create(data: CreateUsuarioDto) {
    const role = await this.prisma.roles.findUnique({
      where: { id: data.rol_id },
    });

    if (!role) throw new Error('Rol no existe');

    const exists = await this.prisma.usuarios.findUnique({
      where: { email: data.email },
    });

    if (exists) throw new Error('Email ya registrado');

    const hash = await bcrypt.hash(data.password, 10);

    return this.prisma.usuarios.create({
      data: {
        ...data,
        password: hash,
      },
    });
  }

  async findAll() {
    return this.prisma.usuarios.findMany({
      where:{activo:true},
      include: { roles: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.usuarios.findUnique({
      where: { id },
      include: { roles: true },
    });
  }

 async update(id: number, data: UpdateUsuarioDto) {

  // si viene nueva contraseña
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10)
  }

  return this.prisma.usuarios.update({
    where: { id },
    data,
  })
}

async remove(id: number) {
    // 1. Verificamos si el usuario existe antes de intentar "eliminarlo"
    const usuario = await this.prisma.usuarios.findUnique({ where: { id } });
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // 2. Aplicamos Soft Delete (cambiando el estado)
    return this.prisma.usuarios.update({
      where: { id },
      data: { 
        activo: false,
        // Si usas una columna de fecha: deleted_at: new Date()
      },
    });
  }
}