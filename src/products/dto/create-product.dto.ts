import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Poncho' })
  nombre!: string;

  @ApiProperty({ example: 'Poncho artesanal', required: false })
  descripcion?: string;
}