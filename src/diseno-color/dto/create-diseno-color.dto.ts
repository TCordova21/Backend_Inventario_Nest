import { ApiProperty } from "@nestjs/swagger";

export class CreateDisenoColorDto {
    @ApiProperty({ example: 1, description: 'ID del diseño' })
    diseno_id!: number;

    @ApiProperty({ example: 2, description: 'ID del color' })
    color_id!: number;

    @ApiProperty({example:'Descripción del diseño con este color', required: false })
    descripcion?: string;


}