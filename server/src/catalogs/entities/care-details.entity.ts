import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('care_details')
export class CareEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ length: 150 })
  icon!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: 'wash' | 'dry' | 'iron' | 'bleach';
}
