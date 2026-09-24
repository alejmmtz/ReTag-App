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
export class TransactionEntity {}
