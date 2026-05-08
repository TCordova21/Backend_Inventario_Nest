import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateNodoDto } from "./create-nodo.dto";

export class UpdateNodoDto extends PartialType(CreateNodoDto) { 
    @ApiProperty({ description: 'Nombre del nodo', example: 'Nuevo Nombre del Nodo', required: false })
    nombre?: string | undefined;
}
