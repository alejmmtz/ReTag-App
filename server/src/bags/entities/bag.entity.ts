import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';
import { GarmentEntity } from '../../garments/entities/garment.entity';

@Entity('bags')
export class BagEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId!: string;

  @PrimaryColumn({ name: 'garment_id' })
  garmentId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.bag, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => GarmentEntity, (garment: GarmentEntity) => garment.bag, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'garment_id' })
  garment!: GarmentEntity;
}
