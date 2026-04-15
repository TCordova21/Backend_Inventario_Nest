import { ApiProperty } from "@nestjs/swagger";

export class CreateColorDto {
    @ApiProperty({ example: 'Rojo', description: 'Nombre del color' })
    nombre!: string;
    
    @ApiProperty({ example: '#FF0000', description: 'Código hexadecimal del color' })
    codigo_hex!: string;
}
