import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PostsService } from './posts.service';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events/:eventId/posts')
@UseGuards(JwtAuthGuard)
export class EventPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findByEvent(
    @Req() req: AuthenticatedRequest,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.postsService.findByEvent(req.user.id, eventId);
  }
}
