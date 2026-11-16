import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';
import {
  ImageTypes,
  MAX_IMAGE_SIZE_BYTES,
  UploadBucket,
} from '../uploads.constants';

export class CreateUploadUrlDto {
  @IsEnum(UploadBucket)
  bucket!: UploadBucket;

  @IsString()
  @IsEnum(ImageTypes)
  contentType!: ImageTypes;

  @IsInt()
  @Min(1)
  @Max(MAX_IMAGE_SIZE_BYTES)
  fileSize!: number;
}
