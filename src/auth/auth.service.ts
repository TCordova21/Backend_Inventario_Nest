import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { StringValue } from 'ms'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  async login(dto: LoginDto) {


    const usuario = await this.prisma.usuarios.findUnique({
      where: { email: dto.email },
      // CLAVE: Incluimos la relación de roles y sucursales
      include: {
        roles: true,
        sucursales: true // Asegúrate que en tu Prisma se llame así la relación
      },

    });



    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');
    if (!usuario.activo) throw new UnauthorizedException('Usuario inactivo');

    const sucursalId = usuario.sucursales?.id || null;

    const passwordValido = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValido) throw new UnauthorizedException('Credenciales inválidas');

    // PASO 1: Enviamos el sucursal_id a la generación del token
    const tokens = await this.generarTokens(
      usuario.id,
      usuario.email,
      usuario.roles?.nombre,
      usuario.sucursales?.id || null

    );

    await this.guardarRefreshToken(usuario.id, tokens.refresh_token);
    console.log('🟢 REFRESH TOKEN GENERADO LOGIN:')
    console.log(tokens.refresh_token)

    await this.prisma.usuarios.update({
      where: { id: usuario.id },
      data: { ultimo_acceso: new Date() },
    });

    return {
      ...tokens,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.roles?.nombre,
        sucursal_id: sucursalId,
        nombre_sucursal: usuario.sucursales?.nombre || 'Sin sucursal'
      },
    };
  }



  async logout(usuarioId: number) {
    await this.prisma.usuarios.update({
      where: { id: usuarioId },
      data: { refresh_token: null },
    });
    return { message: 'Sesión cerrada correctamente' };
  }

  async profile(usuarioId: number) {
    return this.prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        ultimo_acceso: true,
        roles: true,

      },
    });
  }

  async refreshTokens(usuarioId: number, refreshToken: string) {

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: usuarioId },
      include: {
        roles: true,
        sucursales: true
      }
    });

    if (!usuario || !usuario.refresh_token) {
      throw new UnauthorizedException('Sesión expirada');
    }

    const tokenValido = await bcrypt.compare(
      refreshToken,
      usuario.refresh_token
    );

    if (!tokenValido) {
      throw new UnauthorizedException('Token inválido');
    }

    const tokens = await this.generarTokens(
      usuarioId,
      usuario.email,
      usuario.roles?.nombre,
      usuario.sucursales?.id || null
    );

    await this.guardarRefreshToken(
      usuarioId,
      tokens.refresh_token
    );
    console.log('🟢 REFRESH TOKEN RECIBIDO SERVICE:')
    console.log(refreshToken)

    return tokens;
  }

  // PASO 3: Inyectar sucursalId en el Payload del JWT
  private async generarTokens(usuarioId: number, email: string, rol?: string, sucursalId?: number | null) {
    const payload: any = {
      sub: usuarioId,
      email,
      rol: rol || null,
      sucursal_id: sucursalId || null // <--- Esto viajará en cada petición
    };
    console.log('🟢 SECRET USADO PARA FIRMAR REFRESH:')
    console.log(process.env.JWT_REFRESH_SECRET)

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES as StringValue,
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES as StringValue,
      }),
    ])

    return { access_token, refresh_token };
  }


  private async guardarRefreshToken(usuarioId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.usuarios.update({
      where: { id: usuarioId },
      data: { refresh_token: hash },
    });
  }
}