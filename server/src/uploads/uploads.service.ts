import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { UserRoleEnum } from '../common/types/enums';
import {
  ImageTypes,
  UPLOAD_URL_TTL_SECONDS,
  UploadBucket,
} from './uploads.constants';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      endpoint: this.config.getOrThrow<string>('SUPABASE_S3_ENDPOINT'),
      region: this.config.getOrThrow<string>('SUPABASE_S3_REGION'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>(
          'SUPABASE_S3_ACCESS_KEY_ID',
        ),
        secretAccessKey: this.config.getOrThrow<string>(
          'SUPABASE_S3_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  private readonly client: S3Client;

  async createSignedUpload(
    userId: string,
    userRole: UserRoleEnum,
    dto: CreateUploadUrlDto,
  ) {
    if (dto.bucket === UploadBucket.Events && userRole !== UserRoleEnum.STORE) {
      throw new ForbiddenException('Only stores can upload event images');
    }

    if (
      dto.contentType != ImageTypes.gif &&
      dto.contentType != ImageTypes.jpg &&
      dto.contentType != ImageTypes.png &&
      dto.contentType != ImageTypes.webp
    ) {
      throw new BadRequestException('Unsupported image content type');
    }

    const extension = dto.contentType.split('/')[1];
    const key = `${userId}/${randomUUID()}.${extension}`;
    const uploadUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: dto.bucket.toString(),
        Key: key,
        ContentType: dto.contentType.toString(),
        ContentLength: dto.fileSize,
      }),
      { expiresIn: UPLOAD_URL_TTL_SECONDS },
    );
    const publicUrl = this.config
      .getOrThrow<string>('SUPABASE_PUBLIC_URL')
      .replace(/\/$/, '');
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');

    return {
      uploadUrl,
      method: 'PUT',
      headers: { 'Content-Type': dto.contentType },
      url: `${publicUrl}/storage/v1/object/public/${encodeURIComponent(dto.bucket)}/${encodedKey}`,
    };
  }
}
