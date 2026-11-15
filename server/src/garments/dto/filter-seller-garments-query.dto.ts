import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { GarmentStatus } from '../../common/types/enums';

export class FilterSellerGarmentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GarmentStatus)
  status?: GarmentStatus;
}
