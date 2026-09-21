import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GarmentEntity } from '../../garments/entities/garment.entity';

@Entity('sizes')
export class SizeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, default: 'unisex' })
  type!: 'womens  ' | 'mens' | 'girls' | 'boys' | 'unisex' | 'kids';

  @Column({ type: 'varchar', length: 15 })
  label!: string;

  @OneToMany(() => GarmentEntity, (garment) => garment.size)
  garments!: GarmentEntity;
}
