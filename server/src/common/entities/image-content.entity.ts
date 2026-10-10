import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class ImageContent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  url!: string;

  @Column({ name: 'is_cover', default: false })
  isCover!: boolean;
}
