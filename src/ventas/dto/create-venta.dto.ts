import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNumber, IsArray, ValidateNested, Min, IsPositive, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class DetalleVentaDto {
  @ApiProperty({ example: 5, description: 'ID de la categoría/nodo (obligatorio)' })
  @IsInt()
  nodo_id!: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del diseño (opcional para ventas de local)' })
  @IsOptional()
  @IsInt()
  diseno_id?: number;

  @ApiProperty({ example: 2, description: 'Cantidad vendida' })
  @IsInt()
  @IsPositive()
  cantidad!: number;

  @ApiProperty({ example: 25.50, description: 'Precio al que se vendió' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_unitario!: number;
}

export class CreateVentaDto {
  @ApiProperty({ type: [DetalleVentaDto], description: 'Lista de productos' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalles!: DetalleVentaDto[];

  @ApiProperty({ example: 1, description: 'Vendedor que realiza la operación' })
  @IsInt()
  usuario_id!: number;

  @ApiProperty({ example: 1, description: 'Sucursal donde se realiza la venta' })
  @IsInt()
  @IsPositive()
  sucursal_id!: number;
}