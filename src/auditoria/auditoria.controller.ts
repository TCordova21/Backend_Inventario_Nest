import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';

@ApiTags('Auditoría')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly service: AuditoriaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}