import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  ParseUUIDPipe,
  Req,
  Query,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { requestValidationPipe } from '../common/pipes/pipes';
import { FilterUserGarmentsQueryDto } from './dto/filter-user-garments-query.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('me')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: AuthenticatedRequest,
    @Body(requestValidationPipe) data: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, data);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/garments')
  findGarments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(requestValidationPipe) query: FilterUserGarmentsQueryDto,
  ) {
    return this.usersService.findGarments(id, query);
  }

  @Get(':id/posts')
  findPosts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(requestValidationPipe) query: PaginationQueryDto,
  ) {
    return this.usersService.findPosts(id, query);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  follow(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.follow(req.user.id, id);
  }

  // RF-22
  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  unfollow(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.unfollow(req.user.id, id);
  }
}
