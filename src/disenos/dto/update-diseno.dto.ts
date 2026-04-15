
import { PartialType } from '@nestjs/swagger';
import { CreateDisenoDto } from './create-diseno.dto';

export class UpdateDisenoDto extends PartialType(CreateDisenoDto) {}