import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Put,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GarmentsService } from './garments.service';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';
import { requestValidationPipe } from '../common/pipes/pipes';
import { FilterGarmentsQueryDto } from './dto/filter-garments-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('garments')
export class GarmentsController {
  constructor(private readonly garmentsService: GarmentsService) {}

  @Get()
  findAllGarments(@Query(requestValidationPipe) query: FilterGarmentsQueryDto) {
    return this.garmentsService.findAllGarments(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body(requestValidationPipe) createGarmentDto: CreateGarmentDto,
  ) {
    return this.garmentsService.createGarment(
      request.user.id,
      createGarmentDto,
    );
  }

  @Get(':id')
  findOneGarment(@Param('id', ParseUUIDPipe) id: string) {
    return this.garmentsService.findOneGarment(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateGarment(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) updateGarmentDto: UpdateGarmentDto,
  ) {
    return this.garmentsService.updateGarment(
      id,
      request.user.id,
      updateGarmentDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeGarment(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.garmentsService.removeGarment(id, request.user.id);
  }
}
