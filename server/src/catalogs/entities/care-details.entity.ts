import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GarmentEntity } from '../../garments/entities/garment.entity';

@Entity('care_details')
export class CareEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ length: 150 })
  icon!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: 'wash' | 'dry' | 'iron' | 'bleach';

  @OneToMany(() => GarmentEntity, (garment) => garment.care)
  garments!: GarmentEntity[];
}
