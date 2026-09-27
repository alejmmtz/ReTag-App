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
import { TransactionStatusEnum, TransactionTypeEnum } from '../../types/enums';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'buyer_id' })
  buyerId!: string;

  @Column({ name: 'garment_id' })
  garmentId!: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: TransactionTypeEnum,
  })
  transactionType!: TransactionTypeEnum;

  @Column({ name: 'trade_garment_id', nullable: true })
  tradeGarmentId?: string;

  @Column({
    type: 'enum',
    enum: TransactionStatusEnum,
    default: 'pending',
  })
  status!: TransactionStatusEnum;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: UserEntity;

  @ManyToOne(() => GarmentEntity)
  @JoinColumn({ name: 'garment_id' })
  garment!: GarmentEntity;

  @ManyToOne(() => GarmentEntity, { nullable: true })
  @JoinColumn({ name: 'trade_garment_id' })
  tradeGarment?: GarmentEntity;
}
