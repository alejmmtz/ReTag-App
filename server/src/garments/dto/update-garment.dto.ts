import {
  ArrayUnique,
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GarmentConditionEnum,
  MaterialEnum,
  TransactionTypeEnum,
} from '../../common/types/enums';
import { CreateImageDto } from '../../common/dto/create-image.dto';

export class UpdateGarmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(350)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sizeId?: number;

  @IsOptional()
  @IsEnum(MaterialEnum)
  material?: MaterialEnum;

  @IsOptional()
  @IsInt()
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
  eventId?: string | null;

  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  transactionType?: TransactionTypeEnum;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  colorIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  careId?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  images?: CreateImageDto[] | null;
}
