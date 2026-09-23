import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from '../../posts/entities/post.entity';

@Entity('user_likes')
export class UserLikesEntity {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId!: string;

  @PrimaryColumn('uuid', { name: 'post_id' })
  postId!: string;

  @ManyToOne(() => UserEntity, (user) => user.likes, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.likes, {
    nullable: false,
  })
  @JoinColumn({ name: 'post_id' })
  post!: PostEntity;
}
