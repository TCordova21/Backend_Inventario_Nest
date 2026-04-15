import { ApiProperty } from "@nestjs/swagger";

export class AssignCategoriasDto {
  @ApiProperty({ example: [1, 2, 3] })
  categoriaIds!: number[];
}