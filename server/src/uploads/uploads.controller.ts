import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { requestValidationPipe } from '../common/pipes/pipes';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  createSignedUpload(
    @Req() request: AuthenticatedRequest,
    @Body(requestValidationPipe) dto: CreateUploadUrlDto,
  ) {
    return this.uploadsService.createSignedUpload(
      request.user.id,
      request.user.role,
      dto,
    );
  }
}
