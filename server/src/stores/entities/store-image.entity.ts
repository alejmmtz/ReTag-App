import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { StoreEntity } from './store.entity';

@Entity('store_images')
export class StoreImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'store_id' })
  storeId!: number;

  @Column({ name: 'is_profile', default: false })
  isProfile!: boolean;

  @Column()
  url!: string;

  @Column({ name: 'is_cover', default: false })
  isCover!: boolean;

  @ManyToOne(() => StoreEntity, (store) => store.images)
  @JoinColumn({ name: 'store_id' })
  store!: StoreEntity;
}
