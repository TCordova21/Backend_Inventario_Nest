import { ApiProperty } from "@nestjs/swagger";

export class CreateSucursalDto {
    @ApiProperty({ example: 'Matriz Otavalo', description: 'Nombre de la sucursal'  })
    nombre!: string;

    @ApiProperty({ example: 'matriz', description: 'Tipo de sucursal' })
    tipo!: string;

    @ApiProperty({ example: 'Av. Amazonas 1234', required: false, description: 'Dirección de la sucursal' })
    direccion?: string;
    

    @ApiProperty({ example: 2, required: false, description: 'ID del usuario asociado a la sucursal' })
    usuario_id?: number;
}