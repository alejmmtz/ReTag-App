import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GarmentEntity } from '../../garments/entities/garment.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  name!: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'water_saved',
  })
  waterWaste!: number;

  @OneToMany(() => GarmentEntity, (garment) => garment.category)
  garments!: GarmentEntity[];
}
