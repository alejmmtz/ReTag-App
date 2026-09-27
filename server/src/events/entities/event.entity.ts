import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { EventImageEntity } from './event-image.entity';
import { PostEntity } from '../../posts/entities/post.entity';
import { GarmentEntity } from '../../garments/entities/garment.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { EventStatusEnum } from '../../types/enums';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => StoreEntity, (store) => store.events, {
    nullable: true,
  })
  @JoinColumn({ name: 'store_id' })
  store?: StoreEntity;

  @Column()
  title!: string;

  @Column({ length: 650 })
  description!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  status!: EventStatusEnum;

  @Column({ type: 'timestamptz', name: 'starts_at' })
  startsAt!: Date;

  @Column({ type: 'timestamptz', name: 'ends_at' })
  endsAt!: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'int', nullable: true })
  capacity?: number;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
  })
  createdAt!: Date;

  @OneToMany(() => EventImageEntity, (image) => image.event)
  images!: EventImageEntity[];

  @OneToMany(() => PostEntity, (post) => post.eventId)
  posts!: PostEntity[];

  @OneToMany(() => GarmentEntity, (garment) => garment.event)
  garments!: GarmentEntity[];
}
