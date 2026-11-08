import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url!: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isCover?: boolean;
}
