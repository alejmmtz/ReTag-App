import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateGarmentImageDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url!: string;
}
