import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('follows')
export class FollowEntity {
  @PrimaryColumn('uuid', { name: 'follower_id' })
  followerId!: string;

  @PrimaryColumn('uuid', { name: 'followed_id' })
  followedId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, (user) => user.following, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'follower_id' })
  follower!: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.followers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'followed_id' })
  followed!: UserEntity;
}
