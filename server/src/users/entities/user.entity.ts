import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostEntity } from '../../posts/entities/post.entity';
import { GarmentEntity } from '../../garments/entities/garment.entity';
import { UserLikesEntity } from './user-like.entity';
import { FollowEntity } from './follow.entity';
import { BagEntity } from '../../bags/entities/bag.entity';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';
import { UserRoleEnum } from '../../types/enums';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, length: 50 })
  name?: string;

  @Column({ unique: true, length: 30 })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, length: 30 })
  phone!: string;

  @Column()
  password!: string;

  @Column({ name: 'profile_picture' })
  profilePicture!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
  })
  role!: UserRoleEnum;

  @OneToMany(() => PostEntity, (post) => post.userId)
  posts!: PostEntity[];

  @OneToMany(() => GarmentEntity, (garment) => garment.seller)
  garments!: GarmentEntity[];

  @OneToMany(() => BagEntity, (bag) => bag.user)
  bag!: BagEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.buyer)
  transactions!: TransactionEntity[];

  @OneToMany(() => UserLikesEntity, (like) => like.user)
  likes!: UserLikesEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  following!: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.followed)
  followers!: FollowEntity[];
}
