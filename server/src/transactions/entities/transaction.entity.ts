import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { GarmentEntity } from '../../garments/entities/garment.entity';

export enum TransactionTypeEnum {
  SALE = 'SALE',
  TRADE = 'TRADE',
}

export enum TransactionStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'buyer_id' })
  buyerId!: string;

  @Column({ name: 'garment_id' })
  garmentId!: string;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionTypeEnum,
  })
  transactionType!: TransactionTypeEnum;

  @Column({ name: 'trade_garment_id', nullable: true })
  tradeGarmentId?: string;

  @Column({
    type: 'enum',
    enum: TransactionStatusEnum,
    default: TransactionStatusEnum.PENDING,
  })
  status!: TransactionStatusEnum;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
