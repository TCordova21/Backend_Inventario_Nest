import { ApiProperty } from '@nestjs/swagger';

export class CreateDisenoDto {
  @ApiProperty({ example: 'Sasuke' })
  nombre!: string;

  @ApiProperty({ example: 'https://mi-imagen.com/sasuke.png' })
  imagen?: string;

  @ApiProperty({ example: 'Diseño de Sasuke Uchiha', required: false })
  descripcion?: string;

  @ApiProperty({ example: 'NAR-SAS-001', required: false })
  codigo?: string;

  @ApiProperty({ example: 1 })
  subcategoria_id!: number;

  @ApiProperty({ example: 12.50, required: false, description: 'Precio unitario de las prendas con este diseño y color' })
  precio!: number;


}