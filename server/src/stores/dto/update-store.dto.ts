import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStoreImageDto } from './create-store-image.dto';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-zA-Z_0-9]+$/, {
    message:
      'Socialmedia name only can contain letters (a-z, A-Z), numbers(0-9) and underscores.',
  })
  socialmedia?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  storeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(350)
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStoreImageDto)
  images?: CreateStoreImageDto[];
}
