import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PostTypeEnum } from '../../common/types/enums';
import { FeedFilterEnum } from '../../common/types/feed-filter.enum';

export class FilterPostsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(FeedFilterEnum)
  feed: FeedFilterEnum = FeedFilterEnum.FOR_YOU;

  @IsOptional()
  @IsEnum(PostTypeEnum)
  type?: PostTypeEnum;
}
