import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/utils/paginate';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { POST_RELATIONS, POST_SELECT } from './posts.constants';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,

    @InjectRepository(UserLikesEntity)
    private readonly likesRepository: Repository<UserLikesEntity>,
  ) {}

  async findAll(viewerId: string, query: PaginationQueryDto) {
    const { page, limit } = query;

    const [posts, total] = await this.postsRepository.findAndCount({
      select: POST_SELECT,
      relations: POST_RELATIONS,
      order: { createdAt: 'DESC', images: { isCover: 'DESC', id: 'ASC' } },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = await this.toPostResponses(posts, viewerId);

    return paginate(data, total, page, limit);
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
