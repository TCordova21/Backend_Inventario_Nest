import { ApiProperty } from "@nestjs/swagger";

export class CreateClienteDto {

    @ApiProperty({example: 'Juan Perez', description: 'Nombre completo del cliente'})
    nombre!: string;

    @ApiProperty({example: '0990730126', required:false,description: 'Número de contacto del cliente'})
    contacto?: string;

    @ApiProperty({example: 'VIP', required:false,description: 'Tipo de cliente'}   )
    tipo?: string;

}