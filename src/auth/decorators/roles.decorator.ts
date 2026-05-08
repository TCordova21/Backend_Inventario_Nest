import { SetMetadata } from '@nestjs/common';

// Definimos el Enum aquí o impórtalo si ya existe
export enum Role {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
  PRODUCCION = 'PRODUCCION',
}

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);