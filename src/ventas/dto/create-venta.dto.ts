import {ApiProperty} from "@nestjs/swagger";    

export class DetalleVentaDto {
  @ApiProperty({ example: 1 })
  diseno_id!: number;

  @ApiProperty({ example: 2 })
  cantidad!: number;

  @ApiProperty({ example: 25.50 })
  precio_unitario!: number;
} 

export class CreateVentaDto {
  @ApiProperty({ type: [DetalleVentaDto] })
  detalles!: DetalleVentaDto[];

  @ApiProperty({ example: 1 })
  usuario_id!: number;

  @ApiProperty({ example: 1 })
  sucursal_id!: number;
}
