import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostTypeEnum } from '../types/enums';
import { GarmentEntity } from '../../garments/entities/garment.entity';
import { PostImageEntity } from './post-image.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { UserLikesEntity } from '../../users/entities/user-like.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, (user) => user.posts, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  userId!: UserEntity;

  @Column({ length: 350 })
  caption!: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'post_type',
  })
  postType!: PostTypeEnum;

  @ManyToOne(() => GarmentEntity, (garment) => garment.posts, {
    nullable: true,
  })
  @JoinColumn({ name: 'garment_id' })
  garmentId?: GarmentEntity;

  @ManyToOne(() => EventEntity, (event) => event.posts, {
    nullable: true,
  })
  @JoinColumn({ name: 'event_id' })
  eventId?: EventEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => PostImageEntity, (image) => image.post)
  images!: PostImageEntity[];

  @OneToMany(() => UserLikesEntity, (like) => like.post)
  likes!: UserLikesEntity[];
}
