import { Body, Controller, Post, Req } from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
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
}
