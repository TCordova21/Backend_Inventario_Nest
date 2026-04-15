import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Anime' })
  nombre!: string;

  @ApiProperty({ example: 2 })
  producto_id!: number;
}