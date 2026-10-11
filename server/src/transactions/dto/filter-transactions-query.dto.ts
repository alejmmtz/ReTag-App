import { IsEnum, IsOptional } from 'class-validator';
import { TransactionStatusEnum } from '../../common/types/enums';

export class FilterTransactionsQueryDto {
  @IsOptional()
  @IsEnum(TransactionStatusEnum)
  status?: TransactionStatusEnum;
}
