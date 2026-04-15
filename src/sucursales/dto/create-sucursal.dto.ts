import { ApiProperty } from "@nestjs/swagger";

export class CreateSucursalDto {
    @ApiProperty({ example: 'Matriz Otavalo', description: 'Nombre de la sucursal'  })
    nombre!: string;

    @ApiProperty({ example: 'matriz', description: 'Tipo de sucursal' })
    tipo!: string;

    @ApiProperty({ example: 'Av. Amazonas 1234', required: false, description: 'Dirección de la sucursal' })
    direccion?: string;
}