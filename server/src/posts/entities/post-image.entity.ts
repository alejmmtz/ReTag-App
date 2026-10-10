import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { PostEntity } from './post.entity';
import { ImageContent } from '../../common/entities/image-content.entity';

@Entity('post_images')
export class PostImageEntity extends ImageContent {
  @ManyToOne(() => PostEntity, (post) => post.images, {
    nullable: false,
  })
  @JoinColumn({ name: 'post_id' })
  post!: PostEntity;
}
