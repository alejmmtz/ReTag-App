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
  @IsUrl({ require_tld: false })
  url!: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isCover?: boolean;
}
