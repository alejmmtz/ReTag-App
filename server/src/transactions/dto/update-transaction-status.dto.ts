import { IsIn } from 'class-validator';
import { TransactionStatusEnum } from '../../common/types/enums';

export class UpdateTransactionStatusDto {
  @IsIn([
    TransactionStatusEnum.IN_PROGRESS,
    TransactionStatusEnum.COMPLETED,
    TransactionStatusEnum.CANCELLED,
  ])
  status!: TransactionStatusEnum;
}
