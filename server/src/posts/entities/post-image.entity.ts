import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PostEntity } from './post.entity';

@Entity('post_images')
export class PostImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PostEntity, (post) => post.images, {
    nullable: false,
  })
  @JoinColumn({ name: 'post_id' })
  post!: PostEntity;

  @Column({ type: 'boolean', name: 'is_cover', default: false })
  isCover!: boolean;

  @Column({ length: 350 })
  url!: string;
}
