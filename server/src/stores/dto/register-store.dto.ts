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
import { RegisterUserDto } from '../../users/dto/register-user.dto';
import { CreateStoreImageDto } from './create-store-image.dto';

export class RegisterStoreDto extends RegisterUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-zA-Z_0-9]+$/)
  socialmedia?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  storeName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  schedule?: string;

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
