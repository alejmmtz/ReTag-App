import { Injectable } from '@nestjs/common';
import { PostEntity } from './entities/post.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/utils/paginate';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { POST_RELATIONS, POST_SELECT } from './posts.constants';
import { In } from 'typeorm/browser';
import { PostResponse } from '../common/types/post-response.type';

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

  private async toPostResponses(
    posts: PostEntity[],
    viewerId: string,
  ): Promise<PostResponse[]> {
    if (posts.length === 0) {
      return [];
    }

    const ids = posts.map((post) => post.id);

    const [likeCounts, viewerLikes] = await Promise.all([
      this.likesRepository
        .createQueryBuilder('postLike')
        .select('postLike.postId', 'postId')
        .addSelect('COUNT(*)', 'count')
        .where('postLike.postId IN (:...ids)', { ids })
        .groupBy('postLike.postId')
        .getRawMany<{ postId: string; count: string }>(),
      this.likesRepository.find({
        where: { userId: viewerId, postId: In(ids) },
      }),
    ]);

    const likesCountByPost = new Map(
      likeCounts.map((row) => [row.postId, Number(row.count)]),
    );
    const likedByViewer = new Set(viewerLikes.map((like) => like.postId));

    return posts.map((post) =>
      this.toPostResponse(
        post,
        likesCountByPost.get(post.id) ?? 0,
        likedByViewer.has(post.id),
      ),
    );
  }

  private toPostResponse(
    post: PostEntity,
    likesCount: number,
    likedByMe: boolean,
  ): PostResponse {
    return {
      id: post.id,
      caption: post.caption,
      postType: post.postType,
      createdAt: post.createdAt,
      images: (post.images ?? []).map((image) => ({
        id: image.id,
        url: image.url,
        isCover: image.isCover,
      })),
      author: {
        id: post.userId.id,
        username: post.userId.username,
        profilePicture: post.userId.profilePicture,
        role: post.userId.role,
      },
      garment: post.garmentId
        ? {
            id: post.garmentId.id,
            name: post.garmentId.name,
            price: Number(post.garmentId.price),
            status: post.garmentId.status,
          }
        : null,
      event: post.eventId
        ? {
            id: post.eventId.id,
            title: post.eventId.title,
            startsAt: post.eventId.startsAt,
          }
        : null,
      likesCount,
      likedByMe,
    };
  }
}
