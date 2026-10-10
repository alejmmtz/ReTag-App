import { IsIn, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TransactionTypeEnum } from '../../common/types/enums';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  garmentId!: string;

  @IsIn([TransactionTypeEnum.SALE, TransactionTypeEnum.TRADE])
  transactionType!: TransactionTypeEnum;

  @IsOptional()
  @IsUUID()
  tradeGarmentId?: string;
}
