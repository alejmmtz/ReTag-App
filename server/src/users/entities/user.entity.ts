import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRoleEnum } from '../types/enums';
import { PostEntity } from '../../posts/entities/post.entity';
import { GarmentEntity } from '../../garments/entities/garment.entity';

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

  @OneToMany(() => PostEntity, (post) => post.userId)
  posts!: PostEntity[];

  @OneToMany(() => GarmentEntity, (garment) => garment.seller)
  garments!: GarmentEntity[];

  
}
