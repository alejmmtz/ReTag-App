import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { StoreEntity } from './store.entity';
import { ImageContent } from '../../common/entities/image-content.entity';

@Entity('store_images')
export class StoreImage extends ImageContent {
  @Column({ name: 'store_id' })
  storeId!: string;

  @Column({ name: 'is_profile', default: false })
  isProfile!: boolean;

  @ManyToOne(() => StoreEntity, (store) => store.images)
  @JoinColumn({ name: 'store_id' })
  store!: StoreEntity;
}
