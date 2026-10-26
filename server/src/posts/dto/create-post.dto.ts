import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PostTypeEnum } from '../../common/types/enums';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(350)
  caption!: string;

  @IsEnum(PostTypeEnum)
  postType!: PostTypeEnum;

  @IsOptional()
  @IsUUID()
  garmentId?: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  images?: string[];
}
