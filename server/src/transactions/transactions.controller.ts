import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FilterTransactionsQueryDto } from './dto/filter-transactions-query.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { requestValidationPipe } from '../common/pipes/pipes';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body(requestValidationPipe) dto: CreateTransactionDto,
  ) {
    const buyerId = request.user.id;

    return this.transactionsService.create(buyerId, dto);
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query(requestValidationPipe) query: FilterTransactionsQueryDto,
  ) {
    const buyerId = request.user.id;

    return this.transactionsService.findAll(buyerId, query);
  }

  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const buyerId = request.user.id;

    return this.transactionsService.findOne(buyerId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdateTransactionStatusDto,
  ) {
    const buyerId = request.user.id;

    return this.transactionsService.updateStatus(buyerId, id, dto);
  }
}
