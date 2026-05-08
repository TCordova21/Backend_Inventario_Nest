import {  ApiProperty } from "@nestjs/swagger"; 

export class CreateUsuarioDto {

    @ApiProperty({ example: 'Juan', description: 'Nombre completo del usuario' })
    nombre!: string;
    @ApiProperty({ example: 'Perez', description: 'Apellido del usuario' })
    apellido!: string;
    @ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico del usuario' })
    email!: string;
    @ApiProperty({ example: 'password123', description: 'Contraseña del usuario' })
    password!: string;
    @ApiProperty({ example: 1, description: 'ID del rol del usuario' })
    rol_id!: number;    

}