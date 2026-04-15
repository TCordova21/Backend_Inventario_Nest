import { ApiProperty } from "@nestjs/swagger";

export class CreateSubcategoriaDto {
  @ApiProperty({ example: 'Naruto' })
  nombre!: string;

  @ApiProperty({ example: 1 })
  categoria_id!: number;
}