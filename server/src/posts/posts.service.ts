import { Injectable } from '@nestjs/common';
import { PostEntity } from './entities/post.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { paginate } from '../common/utils/paginate';
import {
  POST_RELATIONS,
  POST_SELECT,
  UNDERGROUND_MAX_FOLLOWERS,
} from './posts.constants';
import { In } from 'typeorm/browser';
import { PostResponse } from '../common/types/post-response.type';
import { PostTypeEnum } from '../common/types/enums';
import { FilterPostsQueryDto } from './dto/filter-posts-query.dto';
import { FeedFilterEnum } from '../common/types/feed-filter.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,

    @InjectRepository(UserLikesEntity)
    private readonly likesRepository: Repository<UserLikesEntity>,
  ) {}

  async findAll(viewerId: string, query: FilterPostsQueryDto) {
    const { page, limit, feed, type } = query;

    const idsQuery = this.applyFilters(
      this.postsRepository.createQueryBuilder('post'),
      viewerId,
      feed,
      type,
    ).select('post.id', 'id');

    if (feed === FeedFilterEnum.FOR_YOU) {
      // Puntaje estilo "hot": más likes y más reciente = más arriba
      idsQuery
        .leftJoin('post.likes', 'postLike')
        .addSelect(
          '(COUNT(postLike.postId) + 1) / POWER(EXTRACT(EPOCH FROM (NOW() - post.created_at)) / 3600 + 2, 1.5)',
          'score',
        )
        .groupBy('post.id')
        .orderBy('score', 'DESC')
        .addOrderBy('post.createdAt', 'DESC');
    } else {
      idsQuery.orderBy('post.createdAt', 'DESC');
    }

    idsQuery.offset((page - 1) * limit).limit(limit);

    const countQuery = this.applyFilters(
      this.postsRepository.createQueryBuilder('post'),
      viewerId,
      feed,
      type,
    );

    const [rows, total] = await Promise.all([
      idsQuery.getRawMany<{ id: string }>(),
      countQuery.getCount(),
    ]);

    const ids = rows.map((row) => row.id);

    if (ids.length === 0) {
      return paginate<PostResponse>([], total, page, limit);
    }

    const posts = await this.postsRepository.find({
      where: { id: In(ids) },
      select: POST_SELECT,
      relations: POST_RELATIONS,
      order: { images: { isCover: 'DESC', id: 'ASC' } },
    });

    // find() no respeta el orden de los ids, se restaura el del ranking
    const postsById = new Map(posts.map((post) => [post.id, post]));
    const orderedPosts = ids
      .map((id) => postsById.get(id))
      .filter((post): post is PostEntity => post !== undefined);

    const data = await this.toPostResponses(orderedPosts, viewerId);

    return paginate(data, total, page, limit);
  }

  private applyFilters(
    qb: SelectQueryBuilder<PostEntity>,
    viewerId: string,
    feed: FeedFilterEnum,
    type?: PostTypeEnum,
  ) {
    if (type) {
      qb.andWhere('post.postType = :type', { type });
    }

    if (feed === FeedFilterEnum.FOLLOWING) {
      qb.andWhere(
        'post.user_id IN (SELECT f.followed_id FROM follows f WHERE f.follower_id = :viewerId)',
        { viewerId },
      );
    } else if (feed === FeedFilterEnum.UNDERGROUND) {
      qb.andWhere('post.user_id <> :viewerId', { viewerId }).andWhere(
        '(SELECT COUNT(*) FROM follows f WHERE f.followed_id = post.user_id) < :threshold',
        { threshold: UNDERGROUND_MAX_FOLLOWERS },
      );
    } else {
      qb.andWhere('post.user_id <> :viewerId', { viewerId });
    }

    return qb;
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
