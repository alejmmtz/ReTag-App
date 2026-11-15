import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  UPLOADS_DIR,
  UPLOADS_PUBLIC_PREFIX,
} from './uploads.constants';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          if (!existsSync(UPLOADS_DIR)) {
            mkdirSync(UPLOADS_DIR, { recursive: true });
          }
          callback(null, UPLOADS_DIR);
        },
        filename: (_req, file, callback) => {
          callback(
            null,
            `${randomUUID()}${ALLOWED_IMAGE_TYPES[file.mimetype]}`,
          );
        },
      }),
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
          callback(
            new BadRequestException(
              'Only JPG, PNG, WEBP or GIF images are allowed',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  upload(@Req() request: Request, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('An image file is required (field "file")');
    }

    return {
      url: `${request.protocol}://${request.get('host')}${UPLOADS_PUBLIC_PREFIX}${file.filename}`,
    };
  }
}
