import {
  ExecutionContext,
  Injectable
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard
  extends AuthGuard('jwt-refresh') {

  canActivate(context: ExecutionContext) {

    console.log('🟡 JwtRefreshGuard EJECUTADO')

    return super.canActivate(context)
  }
}