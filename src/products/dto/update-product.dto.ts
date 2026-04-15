import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ example: 'Poncho' })
  nombre?: string;
  @ApiProperty({ example: 'Poncho artesanal', required: false })
  descripcion?: string;
}