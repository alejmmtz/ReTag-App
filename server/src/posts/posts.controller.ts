import { Controller, Get, Body, Req, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { requestValidationPipe } from '../common/pipes/pipes';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';
import { FilterPostsQueryDto } from './dto/filter-posts-query.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query(requestValidationPipe) query: FilterPostsQueryDto,
  ) {
    return this.postsService.findAll(req.user.id, query);
  }
}
