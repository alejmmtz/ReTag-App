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
import { EventEntity } from '../../events/entities/event.entity';

@Entity('stores')
export class StoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', unique: true })
  userId!: string;

  @Column({ nullable: true })
  socialmedia?: string;

  @Column({ name: 'store_name', length: 40 })
  storeName!: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true, length: 350 })
  description?: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @OneToMany(() => StoreImage, (storeImage) => storeImage.store)
  events!: EventEntity[];

  @OneToMany(() => StoreImage, (storeImage) => storeImage.store)
  images!: StoreImage[];
}
