import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GarmentsService } from './garments.service';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';

@Controller('garments')
export class GarmentsController {
  constructor(private readonly garmentsService: GarmentsService) {}

  @Post()
  create(@Body() createGarmentDto: CreateGarmentDto) {
    return this.garmentsService.create(createGarmentDto);
  }

  @Get()
  findAll() {
    return this.garmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.garmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGarmentDto: UpdateGarmentDto) {
    return this.garmentsService.update(+id, updateGarmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.garmentsService.remove(+id);
  }
}
