import {
  Controller,
  Get,
  Body,
  Req,
  Query,
  Post,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
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

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postsService.findOne(req.user.id, id);
  }

  @Post(':id/like')
  like(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postsService.like(req.user.id, id);
  }

  @Delete(':id/like')
  unlike(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postsService.unlike(req.user.id, id);
  }
}
