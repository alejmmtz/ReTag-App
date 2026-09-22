import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('colors')
export class ColorEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 10 })
  hexcode!: string;
}
