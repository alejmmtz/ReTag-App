import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GarmentEntity } from '../../garments/entities/garment.entity';

@Entity('brands')
export class BrandEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 40 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  description?: string | null;

  @OneToMany(() => GarmentEntity, (garment) => garment.brand)
  garments!: GarmentEntity[];
}
