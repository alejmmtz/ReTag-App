import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
export class TagEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  name!: string;
}
