import { ApiProperty } from "@nestjs/swagger";

export class CreateRolDto {
    @ApiProperty({ example: 'ADMIN', description: 'Nombre del rol' })
    nombre!: string;    
  
}

