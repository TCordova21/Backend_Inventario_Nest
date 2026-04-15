import { Injectable } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) {}

    async create(data: CreateRolDto) {
        return this.prisma.roles.create({
            data,
        });
    }   

    async findAll() {
        return this.prisma.roles.findMany();
    }   
}
