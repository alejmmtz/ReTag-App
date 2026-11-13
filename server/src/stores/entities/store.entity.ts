import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';
import { StoreImage } from './store-image.entity';
import { EventEntity } from '../../events/entities/event.entity';
import { GarmentEntity } from '../../garments/entities/garment.entity';

@Entity('stores')
export class StoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({ nullable: true, length: 20 })
  socialmedia?: string;

  @Column({ name: 'store_name', length: 40 })
  storeName!: string;

  @Column({ nullable: true, length: 100 })
  schedule?: string;

  @Column({ nullable: true, length: 255 })
  location?: string;

  @Column({ nullable: true, length: 350 })
  description?: string;

  @OneToOne(() => UserEntity, (user) => user.store, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  @OneToMany(() => EventEntity, (event) => event.store)
  events!: EventEntity[];

  @OneToMany(() => GarmentEntity, (garment) => garment.store)
  garments!: GarmentEntity[];

  @ManyToOne(() => StoreEntity, (store) => store.garments, {
    nullable: true,
  })
  @JoinColumn({ name: 'store_id' })
  store?: StoreEntity;

  @OneToMany(() => StoreImage, (storeImage) => storeImage.store, {
    cascade: true,
  })
  images!: StoreImage[];
}
