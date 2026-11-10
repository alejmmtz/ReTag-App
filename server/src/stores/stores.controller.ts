import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { requestValidationPipe } from '../common/pipes/pipes';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body(requestValidationPipe) dto: CreateStoreDto,
  ) {
    return this.storesService.create(req.user.id, dto);
  }

  @Get('me')
  findMine(@Req() req: AuthenticatedRequest) {
    return this.storesService.findMine(req.user.id);
  }
}
