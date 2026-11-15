import { IsUUID } from 'class-validator';

export class CreateBagDto {
  @IsUUID()
  garmentId!: string;
}
