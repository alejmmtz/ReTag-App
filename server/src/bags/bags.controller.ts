import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BagsService } from './bags.service';
import { CreateBagDto } from './dto/create-bag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRoleEnum } from '../common/types/enums';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { requestValidationPipe } from '../common/pipes/pipes';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('bags')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.USER)
export class BagsController {
  constructor(private readonly bagsService: BagsService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body(requestValidationPipe) dto: CreateBagDto,
  ) {
    return this.bagsService.create(req.user.id, dto);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query(requestValidationPipe) query: PaginationQueryDto,
  ) {
    return this.bagsService.findAll(req.user.id, query);
  }

  @Get(':garmentId')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('garmentId', ParseUUIDPipe) garmentId: string,
  ) {
    return this.bagsService.findOne(req.user.id, garmentId);
  }

  @Delete(':garmentId')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('garmentId', ParseUUIDPipe) garmentId: string,
  ) {
    return this.bagsService.remove(req.user.id, garmentId);
  }
}
