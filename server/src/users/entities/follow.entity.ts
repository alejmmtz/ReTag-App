import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('follows')
export class FollowEntity {
  @PrimaryColumn('uuid', { name: 'follower_id' })
  followerId!: string;

  @PrimaryColumn('uuid', { name: 'followed_user_id' })
  followedUserId!: string;

  @ManyToOne(() => UserEntity, (user) => user.following, {
    nullable: false,
  })
  @JoinColumn({ name: 'follower_id' })
  follower!: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.followers, {
    nullable: false,
  })
  @JoinColumn({ name: 'followed_user_id' })
  followedUser!: UserEntity;
}
