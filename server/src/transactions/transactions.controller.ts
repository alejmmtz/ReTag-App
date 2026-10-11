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
} from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FilterTransactionsQueryDto } from './dto/filter-transactions-query.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { requestValidationPipe } from '../common/pipes/pipes';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Req() request: any,
    @Body(requestValidationPipe) dto: CreateTransactionDto,
  ) {
    // TODO: Protect route with authentication guard once auth is implemented
    const buyerId = request.user.id;

    return this.transactionsService.create(buyerId, dto);
  }

  @Get()
  findAll(
    @Req() request: any,
    @Query(requestValidationPipe) query: FilterTransactionsQueryDto,
  ) {
    const buyerId = request.user.id;

    return this.transactionsService.findAll(buyerId, query);
  }

  @Get(':id')
  findOne(@Req() request: any, @Param('id', ParseUUIDPipe) id: string) {
    const buyerId = request.user.id;

    return this.transactionsService.findOne(buyerId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() request: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdateTransactionStatusDto,
  ) {
    const buyerId = request.user.id;

    return this.transactionsService.updateStatus(buyerId, id, dto);
  }
}
