import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsPositive, Min } from "class-validator";

export class CreateInventarioDto {
    @ApiPropertyOptional({ 
        example: 1, 
        description: 'ID del diseño. Opcional para inventario global en locales.' 
    })
    @IsOptional()
    @IsInt()
    diseno_id?: number;

    @ApiPropertyOptional({ 
        example: 5, 
        description: 'ID del nodo (Categoría/Producto global). Obligatorio para locales.' 
    })
    @IsOptional()
    @IsInt()
    nodo_id?: number;

    @ApiProperty({ example: 1, description: 'ID de la sucursal' })
    @IsInt()
    sucursal_id!: number;

    @ApiProperty({ example: 100, description: 'Cantidad inicial en inventario' })
    @IsInt()
    @Min(0)
    cantidad!: number;

    @ApiPropertyOptional({ example: 10, description: 'Cantidad mínima para alertas' })
    @IsOptional()
    @IsInt()
    @Min(0)
    stock_minimo?: number;

    @ApiPropertyOptional({ example: 100, description: 'Cantidad máxima permitida' })
    @IsOptional()
    @IsInt()
    @Min(0)
    stock_maximo?: number;
}