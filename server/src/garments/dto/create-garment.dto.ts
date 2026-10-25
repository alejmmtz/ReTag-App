import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
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

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  categoryId!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  sizeId!: number;

  @IsNotEmpty()
  @IsEnum(MaterialEnum)
  material!: MaterialEnum;

  @IsNumber()
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
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  colorIds!: number[];

  @IsArray()
  @IsNotEmpty()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  tagIds!: number[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  careId?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  images?: CreateImageDto[];
}
