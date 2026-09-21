import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GarmentEntity } from '../../garments/entities/garment.entity';

@Entity('brands')
export class BrandEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ length: 150 })
  logo?: string;

  @Column({ length: 150 })
  description?: string;

  @OneToMany(() => GarmentEntity, (garment) => garment.brand)
  garments!: GarmentEntity[];
}
