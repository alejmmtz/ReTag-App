import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRoleEnum } from '../types/enums';
import { PostEntity } from '../../posts/entities/post.entity';
import { GarmentEntity } from '../../garments/entities/garment.entity';
import { UserLikesEntity } from './user-like.entity';
import { FollowEntity } from './follow.entity';
import { StoreEntity } from '../../stores/entities/store.entity';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
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
  @OneToOne(() => StoreEntity, (store) => store.user)
  store?: StoreEntity;

  @OneToMany(() => PostEntity, (post) => post.userId)
  posts!: PostEntity[];

  @OneToMany(() => GarmentEntity, (garment) => garment.seller)
  garments!: GarmentEntity[];

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.user)
  cartItems!: CartItemEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.buyer)
  transactions!: TransactionEntity[];

  @OneToMany(() => UserLikesEntity, (like) => like.user)
  likes!: UserLikesEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  following!: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.followedUser)
  followers!: FollowEntity[];

  @OneToMany(
    () => EventParticipantEntity,
    (eventParticipant) => eventParticipant.user,
  )
  eventParticipations!: EventParticipantEntity[];
}
