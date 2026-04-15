import {  ApiProperty } from "@nestjs/swagger"; 

export class CreateUsuarioDto {

    @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo del usuario' })
    nombre!: string;
    @ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico del usuario' })
    email!: string;
    @ApiProperty({ example: 'password123', description: 'Contraseña del usuario' })
    password!: string;
    @ApiProperty({ example: 1, description: 'ID del rol del usuario' })
    rol_id!: number;    

}