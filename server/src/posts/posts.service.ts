import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostEntity } from './entities/post.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { paginate } from '../common/utils/paginate';
import {
  POST_RELATIONS,
  POST_SELECT,
  UNDERGROUND_MAX_FOLLOWERS,
} from './posts.constants';
import {
  PostDetailResponse,
  PostResponse,
} from '../common/types/post-response.type';
import { PostTypeEnum } from '../common/types/enums';
import { FilterPostsQueryDto } from './dto/filter-posts-query.dto';
import { FeedFilterEnum } from '../common/types/feed-filter.enum';
import { FollowEntity } from '../users/entities/follow.entity';
import { EventParticipantEntity } from '../events/entities/event-participant.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  EventParticipantStatusEnum,
  UserRoleEnum,
} from '../common/types/enums';
import { UserEntity } from '../users/entities/user.entity';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { EventEntity } from '../events/entities/event.entity';
import { DataSource } from 'typeorm/browser';
import { PostImageEntity } from './entities/post-image.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,

    @InjectRepository(UserLikesEntity)
    private readonly likesRepository: Repository<UserLikesEntity>,

    @InjectRepository(FollowEntity)
    private readonly followsRepository: Repository<FollowEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(GarmentEntity)
    private readonly garmentsRepository: Repository<GarmentEntity>,

    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,

    @InjectRepository(EventParticipantEntity)
    private readonly eventParticipantsRepository: Repository<EventParticipantEntity>,

    private readonly dataSource: DataSource,
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

    // findse restaura el del ranking
    const postsById = new Map(posts.map((post) => [post.id, post]));
    const orderedPosts = ids
      .map((id) => postsById.get(id))
      .filter((post): post is PostEntity => post !== undefined);

    const data = await this.toPostResponses(orderedPosts, viewerId);

    return paginate(data, total, page, limit);
  }

  async findOne(viewerId: string, id: string): Promise<PostDetailResponse> {
    const post = await this.postsRepository.findOne({
      where: { id },
      select: POST_SELECT,
      relations: POST_RELATIONS,
      order: { images: { isCover: 'DESC', id: 'ASC' } },
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    const [responses, isFollowingAuthor] = await Promise.all([
      this.toPostResponses([post], viewerId),
      this.followsRepository.exists({
        where: { followerId: viewerId, followedId: post.userId.id },
      }),
    ]);

    return { ...responses[0], isFollowingAuthor };
  }

  private async ensurePostExists(id: string) {
    const exists = await this.postsRepository.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
  }
  async like(userId: string, postId: string) {
    await this.ensurePostExists(postId);

    const existingLike = await this.likesRepository.findOne({
      where: { userId, postId },
    });

    if (existingLike) {
      throw new ConflictException('You already liked this post');
    }

    await this.likesRepository.save(
      this.likesRepository.create({ userId, postId }),
    );

    return {
      postId,
      liked: true,
      likesCount: await this.likesRepository.count({ where: { postId } }),
    };
  }

  async unlike(userId: string, postId: string) {
    const like = await this.likesRepository.findOne({
      where: { userId, postId },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likesRepository.remove(like);

    return {
      postId,
      liked: false,
      likesCount: await this.likesRepository.count({ where: { postId } }),
    };
  }

  async create(userId: string, dto: CreatePostDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    this.validatePostRules(user.role, dto);

    const garment = dto.garmentId
      ? await this.findOwnGarment(userId, dto.garmentId)
      : undefined;

    const event = dto.eventId
      ? await this.findLinkableEvent(user, dto.eventId)
      : undefined;

    const saved = await this.dataSource.transaction(async (manager) => {
      const post = await manager.save(PostEntity, {
        caption: dto.caption,
        postType: dto.postType,
        userId: { id: user.id },
        garmentId: garment,
        eventId: event,
      });

      if (dto.images?.length) {
        await manager.save(
          PostImageEntity,
          dto.images.map((url, index) => ({
            url,
            isCover: index === 0,
            post: { id: post.id },
          })),
        );
      }

      return post;
    });

    return this.findOne(userId, saved.id);
  }

  async update(userId: string, id: string, dto: UpdatePostDto) {
    const post = await this.findOwnedPost(userId, id);

    await this.dataSource.transaction(async (manager) => {
      if (dto.caption !== undefined) {
        await manager.update(PostEntity, { id }, { caption: dto.caption });
      }

      if (dto.images !== undefined) {
        await manager.remove(PostImageEntity, post.images);
        await manager.save(
          PostImageEntity,
          dto.images.map((url, index) => ({
            url,
            isCover: index === 0,
            post: { id },
          })),
        );
      }
    });

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const post = await this.findOwnedPost(userId, id);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(UserLikesEntity, { postId: id });
      await manager.remove(PostImageEntity, post.images);
      await manager.delete(PostEntity, { id });
    });

    return { message: 'Post deleted successfully' };
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
