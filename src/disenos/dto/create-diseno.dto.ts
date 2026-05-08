import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsInt, IsBoolean } from 'class-validator';

export class CreateDisenoDto {
  @ApiProperty({ example: 'Goku Ultra Instinto' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'Bordado detallado en espalda' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 'https://tu-storage.com/goku.png' })
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiProperty({ example: 'DIS-001' })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({ example: 25.50 })
  @IsOptional()
  @IsNumber()
  precio?: number;

  @ApiProperty({ example: 5, description: 'ID del nodo/contenedor al que pertenece' })
  @IsInt()
  nodo_id!: number;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}