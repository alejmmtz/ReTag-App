import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { EventEntity } from './event.entity';
import { ImageContent } from '../../common/entities/image-content.entity';

@Entity('event_images')
export class EventImageEntity extends ImageContent {
  @ManyToOne(() => EventEntity, (event) => event.images, {
    nullable: false,
  })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;
}
