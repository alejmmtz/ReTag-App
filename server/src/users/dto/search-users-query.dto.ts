import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class SearchUsersQueryDto extends PaginationQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  q!: string;
}
