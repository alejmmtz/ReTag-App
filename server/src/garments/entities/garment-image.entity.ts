import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GarmentEntity } from './garment.entity';

@Entity('garment_image')
export class GarmentImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => GarmentEntity, (garment) => garment.images, {
    nullable: false,
  })
  @JoinColumn({ name: 'garment_id' })
  garment!: GarmentEntity;

  @Column({ type: 'boolean', name: 'is_cover', default: false })
  isCover!: boolean;

  @Column({ length: 350 })
  url!: string;
}
