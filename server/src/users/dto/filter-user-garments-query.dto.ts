/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import { GarmentStatus } from '../../common/types/enums';

export class FilterUserGarmentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GarmentStatus)
  status?: GarmentStatus;
}
