import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { EventEntity } from './event.entity';

@Entity('event_images')
export class EventImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => EventEntity, (event) => event.images, {
    nullable: false,
  })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column()
  url!: string;

  @Column({ name: 'is_cover', default: false })
  isCover!: boolean;
}
