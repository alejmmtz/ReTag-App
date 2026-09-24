import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';
import { GarmentEntity } from '../../garments/entities/garment.entity';
import { TransactionTypeEnum } from '../../transactions/entities/transaction.entity';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId!: string;

  @PrimaryColumn({ name: 'garment_id' })
  garmentId!: string;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionTypeEnum,
  })
  transactionType!: TransactionTypeEnum;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => GarmentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'garment_id' })
  garment!: GarmentEntity;
}
