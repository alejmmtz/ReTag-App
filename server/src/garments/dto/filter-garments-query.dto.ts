import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GarmentConditionEnum,
  GarmentStatus,
  MaterialEnum,
  TransactionTypeEnum,
} from '../../common/types/enums';

export class FilterGarmentsQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sizeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  brand?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  color?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tag?: number;

  @IsOptional()
  @IsEnum(MaterialEnum)
  material?: MaterialEnum;

  @IsOptional()
  @IsEnum(GarmentStatus)
  status?: GarmentStatus;

  @IsOptional()
  @IsEnum(GarmentConditionEnum)
  condition?: GarmentConditionEnum;

  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  transactionType?: TransactionTypeEnum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50000)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50000)
  maxPrice?: number;

  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  takeQuantity: number = 25;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  skipQuantity: number = 0;
}
