import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';
import { StoreImage } from './store-image.entity';

@Entity('stores')
export class StoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', unique: true })
  userId!: string;

  @Column({ nullable: true })
  socialmedia?: string;

  @Column({ name: 'store_name' })
  storeName!: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  description?: string;

  @OneToOne(() => UserEntity, (user) => user.store)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @OneToMany(() => StoreImage, (storeImage) => storeImage.store)
  images!: StoreImage[];
}
