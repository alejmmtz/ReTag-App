import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('colors')
export class ColorEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 25 })
  name!: string;

  @Column({ type: 'varchar', length: 10 })
  hexcode!: string;
}
