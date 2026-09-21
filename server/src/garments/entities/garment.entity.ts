import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BrandEntity } from '../../catalogs/entities/brand.entity';
import { SizeEntity } from '../../catalogs/entities/size.entity';
import { CategoryEntity } from '../../catalogs/entities/category.entity';

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
  material!:
    | 'cotton'
    | 'twill'
    | 'voile'
    | 'linen'
    | 'silk'
    | 'cotton silk'
    | 'lyosell'
    | 'viscose'
    | 'hemp'
    | 'mesh'
    | 'poliester'
    | 'velvet'
    | 'elastane'
    | 'canvas'
    | 'panama'
    | 'crêpe'
    | 'georgette'
    | 'gabardine'
    | 'peach skin'
    | 'u-circular';

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
  transactionType!: 'trade' | 'buy' | 'both';

  @ManyToOne(() => EventEntity, (event) => event.garments, {
    nullable: false,
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
}
