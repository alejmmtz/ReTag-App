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
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { requestValidationPipe } from '../common/pipes/pipes';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';
import { FilterPostsQueryDto } from './dto/filter-posts-query.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body(requestValidationPipe) dto: CreatePostDto,
  ) {
    return this.postsService.create(req.user.id, dto);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postsService.findOne(req.user.id, id);
  }

  @Put(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(requestValidationPipe) dto: UpdatePostDto,
  ) {
    return this.postsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postsService.remove(req.user.id, id);
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
