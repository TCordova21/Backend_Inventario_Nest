import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsEnum, Min, IsNotEmpty, IsNumber } from "class-validator";

export class CreateMovimientoDto {
    @ApiPropertyOptional({ example: 1, description: 'ID del diseño. Opcional si el movimiento es por nodo global.' })
    @IsOptional()
    @IsInt()
    diseno_id?: number | null;

    @ApiPropertyOptional({ example: 5, description: 'ID del nodo. Obligatorio si no hay diseño.' })
    @IsNumber()
    nodo_id?: number;

    @ApiPropertyOptional({ example: 1, description: 'ID de la sucursal de origen (null si es ingreso externo)' })
    @IsOptional()
    @IsInt()
    sucursal_origen_id?: number;

    @ApiPropertyOptional({ example: 2, description: 'ID de la sucursal de destino (null si es venta o baja)' })
    @IsOptional()
    @IsInt()
    sucursal_destino_id?: number;

    @ApiProperty({ 
        example: 'TRASLADO', 
        description: 'Tipo de movimiento: VENTA, TRASLADO, INGRESO, AJUSTE' 
    })
    @IsString()
    @IsNotEmpty()
    tipo_movimiento!: string;

    @ApiProperty({ example: 20, description: 'Cantidad de producto que se mueve' })
    @IsInt()
    @Min(1)
    cantidad!: number;

    @ApiPropertyOptional({ example: 'Guía #123', description: 'Referencia del movimiento' })
    @IsOptional()
    @IsString()
    referencia?: string;

    @ApiPropertyOptional({ example: 'Traslado de matriz a sucursal Ibarra', description: 'Observación' })
    @IsOptional()
    @IsString()
    observacion?: string;

    @ApiPropertyOptional({ example: 1, description: 'ID del usuario que realiza el movimiento' })
    @IsOptional()
    @IsInt()
    usuario_id?: number;

    @ApiPropertyOptional({ example: 1, description: 'ID del usuario que confirmo el movimiento' })
    @IsOptional()
    @IsInt()
    usuario_confirmacion_id?: number;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @IsInt()
    cantidad_confirmada?: number;

    @ApiPropertyOptional({ example: '2026-04-29T16:20:39.101Z' })
    @IsOptional()
    @IsString() // O IsISO8601()
    fecha_confirmacion?: string;

}