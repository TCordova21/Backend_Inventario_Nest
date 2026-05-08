import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Si pasas un argumento al decorador @GetUser('email'), devolverá solo esa propiedad
    if (data) {
      return request.user?.[data];
    }
    // Si no pasas nada, devuelve todo el objeto user que inyectó Passport
    return request.user;
  },
);