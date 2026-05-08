import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, IsIn } from 'class-validator';

export class CreateNodoDto {
  @ApiProperty({ example: 'Ponchos', description: 'Nombre del producto raíz o contenedor' })
  @IsString()
  nombre!: string;

  @ApiProperty({ 
    example: 'producto', 
    enum: ['producto', 'contenedor'],
    description: 'Define si es el origen del árbol o una carpeta interna' 
  })
  @IsString()
  @IsIn(['producto', 'contenedor'])
  tipo!: string;

  @ApiProperty({ example: 1, required: false, description: 'ID del nodo padre' })
  @IsOptional()
  @IsInt()
  padre_id?: number;

  @ApiProperty({ 
    example: 'https://link-a-tu-imagen.com/foto.jpg', 
    required: false,
    description: 'Imagen principal (usualmente solo para tipo producto)'
  })
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiProperty({ example: true, default: true, required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}