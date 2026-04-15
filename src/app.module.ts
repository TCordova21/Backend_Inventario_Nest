import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { CategoriasModule } from './categorias/categorias.module';
import { SubcategoriasModule } from './subcategorias/subcategorias.module';
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


@Module({
  imports: [PrismaModule, ProductsModule, CategoriasModule, SubcategoriasModule, DisenosModule, ColoresModule, DisenoColorModule, InventarioModule, SucursalesModule, MovimientosModule, RolesModule, UsuariosModule, ClientesModule, VentasModule, AuditoriaModule],
})
export class AppModule {}
