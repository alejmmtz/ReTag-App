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
  @IsNumber()
  @Min(1)
  sizeId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  brand?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  color?: number;

  @IsOptional()
  @IsNumber()
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
  @IsNumber()
  @Min(0)
  @Max(50000)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50000)
  maxPrice?: number;

  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsInt()
  @Min(25)
  @Max(500)
  takeQuantity: number = 25;
}
