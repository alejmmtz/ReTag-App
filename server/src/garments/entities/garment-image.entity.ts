import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { GarmentEntity } from './garment.entity';
import { ImageContent } from '../../common/entities/image-content.entity';

@Entity('garment_image')
export class GarmentImageEntity extends ImageContent {
  @ManyToOne(() => GarmentEntity, (garment) => garment.images, {
    nullable: false,
  })
  @JoinColumn({ name: 'garment_id' })
  garment!: GarmentEntity;
}
