import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { GarmentConditionEnum, MaterialEnum } from '../../common/types/enums';
import { CreateGarmentImageDto } from './create-image.dto';

export class UpdateGarmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(350)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  sizeId?: number;

  @IsOptional()
  @IsEnum(MaterialEnum)
  material?: MaterialEnum;

  @IsOptional()
  @IsNumber()
  @Min(1)
  brandId?: number;

  @IsOptional()
  @IsDateString()
  datePurchased?: string;

  @IsOptional()
  @IsEnum(GarmentConditionEnum)
  condition?: GarmentConditionEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  price?: number;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  colorIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  careId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  images?: CreateGarmentImageDto[];
}
