import { ApiProperty } from "@nestjs/swagger";
export class CreateMovimientoDto {

    @ApiProperty({ example: 1, description: 'ID del diseño-color' })
    diseno_id!: number;

    @ApiProperty({ example: 1, description: 'ID de la sucursal de origen' })
    sucursal_origen_id?: number;

    @ApiProperty({ example: 1, description: 'ID de la sucursal de destino' })
    sucursal_destino_id?: number;
    
    @ApiProperty({ example: 'VENTA', description: 'Tipo de movimiento  ' })
    tipo_movimiento!: string;

    @ApiProperty({ example: 20, description: 'Cantidad de producto que se mueve' })
    cantidad!: number;

    @ApiProperty({ example: 'venta mostrador', required: false ,description: 'Referencia del movimiento' })
    referencia?: string;

    @ApiProperty({ example: 'Observacion Opcional', required: false, description: 'Observacion del movimiento' })
    observacion!: string;
}