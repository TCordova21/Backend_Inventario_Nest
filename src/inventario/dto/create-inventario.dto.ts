import { ApiProperty } from "@nestjs/swagger";

export class CreateInventarioDto {
    @ApiProperty({ example: 1, description: 'ID del diseño-color' })
    diseno_id!: number;

    @ApiProperty ({})
    sucursal_id!: number;

    @ApiProperty({ example: 100, description: 'Cantidad en inventario' })
    cantidad!: number;

    @ApiProperty({example: 10, description: 'Cantidad minima del producto' })
    stock_minimo!: number;

     @ApiProperty({example: 100, description: 'Cantidad maxima del producto' })
    stock_maximo!: number;
}