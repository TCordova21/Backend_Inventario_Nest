import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';


@ApiTags('Products')
@Controller('products')
export class ProductsController {

  constructor(private readonly service: ProductsService) {}

  @Post()
  @ApiBody({ type: CreateProductDto })
  create(@Body() body: CreateProductDto) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Put(':id')
  @ApiBody({ type: CreateProductDto })
  update(@Param('id') id: string, @Body() body: CreateProductDto) {
    return this.service.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }


}