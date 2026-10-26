import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { GarmentsService } from './garments.service';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';
import { requestValidationPipe } from '../common/pipes/pipes';
import { FilterGarmentsQueryDto } from './dto/filter-garments-query.dto';

@Controller('garments')
export class GarmentsController {
  constructor(private readonly garmentsService: GarmentsService) {}

  @Get()
  findAllGarments(@Query(requestValidationPipe) query: FilterGarmentsQueryDto) {
    return this.garmentsService.findAllGarments(query);
  }

  @Post()
  create(@Body() createGarmentDto: CreateGarmentDto) {
    return this.garmentsService.createGarment(createGarmentDto);
  }

  @Get(':id')
  findOneGarment(@Param('id', ParseUUIDPipe) id: string) {
    return this.garmentsService.findOneGarment(id);
  }

  @Put(':id')
  updateGarment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGarmentDto: UpdateGarmentDto,
  ) {
    return this.garmentsService.updateGarment(id, updateGarmentDto);
  }
}
