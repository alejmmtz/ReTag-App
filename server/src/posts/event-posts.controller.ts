import { Controller, Get, Param, ParseUUIDPipe, Req } from '@nestjs/common';

import { PostsService } from './posts.service';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('events/:eventId/posts')
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
