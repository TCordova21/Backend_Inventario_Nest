import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { DisenosModule } from './disenos/disenos.module';
import { ColoresModule } from './colores/colores.module';
import { DisenoColorModule } from './diseno-color/diseno-color.module';
import { InventarioModule } from './inventario/inventario.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { VentasModule } from './ventas/ventas.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { NodosModule } from './nodos/nodos.module';
import { AuthModule } from './auth/auth.module';

import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';



@Module({
  imports: [PrismaModule,  DisenosModule, ColoresModule, DisenoColorModule, InventarioModule, SucursalesModule, MovimientosModule, RolesModule, UsuariosModule, ClientesModule, VentasModule, AuditoriaModule, NodosModule, AuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    
    },
     {
    provide: APP_GUARD,
    useClass: RolesGuard,   // 👈 DESPUÉS
  },
  ],  
})
export class AppModule {}
