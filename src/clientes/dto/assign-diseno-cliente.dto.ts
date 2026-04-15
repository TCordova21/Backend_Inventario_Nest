import { ApiProperty } from "@nestjs/swagger";

export class AssignDisenoClienteDto {


    @ApiProperty({example: 1, description: 'ID del diseño'})
    diseno_id!: number;

    @ApiProperty({example: 1, description: 'ID del cliente'})
    cliente_id!: number;

    @ApiProperty({example: true, description: 'Indica si el diseño es exclusivo para el cliente'})
    exclusivo!: boolean;
}