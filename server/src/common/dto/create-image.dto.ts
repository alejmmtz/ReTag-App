import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url!: string;
}
