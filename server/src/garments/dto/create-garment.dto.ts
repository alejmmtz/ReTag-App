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

export class CreateGarmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(350)
  description!: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  categoryId!: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  sizeId!: number;

  @IsNotEmpty()
  @IsEnum(MaterialEnum)
  material!: MaterialEnum;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  brandId!: number;

  @IsNotEmpty()
  @IsDateString()
  datePurchased!: string;

  @IsOptional()
  @IsEnum(GarmentConditionEnum)
  condition?: GarmentConditionEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  price?: number;

  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  transactionType?: TransactionTypeEnum;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsArray()
  @ArrayUnique()
  @IsNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  colorIds!: number[];

  @IsArray()
  @IsNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds!: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  careId?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  images?: CreateImageDto[];
}
