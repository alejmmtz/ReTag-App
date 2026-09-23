import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BrandEntity } from '../../catalogs/entities/brand.entity';
import { SizeEntity } from '../../catalogs/entities/size.entity';
import { CategoryEntity } from '../../catalogs/entities/category.entity';
import { GarmentImageEntity } from './garment-image.entity';
import { ColorEntity } from '../../catalogs/entities/color.entity';
import { CareEntity } from '../../catalogs/entities/care-details.entity';
import { TagEntity } from '../../catalogs/entities/tag.entity';
import { MaterialEnum } from '../types/enums';
import { EventEntity } from '../../events/entities/event.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('garments')
export class GarmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 350 })
  description!: string;

  @ManyToOne(() => CategoryEntity, (category) => category.garments, {
    nullable: false,
  })
  @JoinColumn({ name: 'category_id' })
  category!: CategoryEntity;

  @ManyToOne(() => SizeEntity, (size) => size.garments, {
    nullable: false,
  })
  @JoinColumn({ name: 'size_id' })
  size!: SizeEntity;

  @Column({ type: 'varchar', length: 20 })
  material!: MaterialEnum;

  @ManyToOne(() => BrandEntity, (brand) => brand.garments, {
    nullable: false,
  })
  @JoinColumn({ name: 'brand_id' })
  brand!: BrandEntity;

  @Column({ type: 'date', name: 'date_purchased' })
  datePurchased!: Date;

  @Column({ type: 'varchar', length: 20, default: 'available' })
  status!: 'available' | 'sold' | 'traded';

  @Column({ length: 350, name: 'water_saved' })
  waterSaved!: string;

  @Column({ type: 'decimal' })
  price!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'both',
    name: 'transaction_type',
  })
  transactionType!: 'trade' | 'purchase' | 'both';

  @ManyToOne(() => EventEntity, (event) => event.garments, {
    nullable: true,
  })
  @JoinColumn({ name: 'event_id' })
  event?: EventEntity;

  @ManyToOne(() => UserEntity, (seller) => seller.garments, {
    nullable: false,
  })
  @JoinColumn({ name: 'seller_id' })
  seller!: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => GarmentImageEntity, (image) => image.garment)
  images!: GarmentImageEntity[];

  @ManyToMany(() => ColorEntity)
  @JoinTable()
  colors!: ColorEntity[];

  @ManyToMany(() => CareEntity)
  @JoinTable()
  cares!: CareEntity[];

  @ManyToMany(() => TagEntity)
  @JoinTable()
  tags!: TagEntity[];
}
