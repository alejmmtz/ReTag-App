import { IsEnum, IsOptional } from 'class-validator';
import { EventStatusEnum } from '../../common/types/enums';

export class FilterEventsQueryDto {
  @IsOptional()
  @IsEnum(EventStatusEnum)
  status?: EventStatusEnum;
}
