import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GarmentEntity } from '../../garments/entities/garment.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @OneToMany(() => GarmentEntity, (garment) => garment.category)
  garments!: GarmentEntity[];
}
