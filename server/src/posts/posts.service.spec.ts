import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PostsService } from './posts.service';
import { PostEntity } from './entities/post.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PostTypeEnum, UserRoleEnum } from '../common/types/enums';
import { UNDERGROUND_MAX_FOLLOWERS } from './posts.constants';
import { FilterPostsQueryDto } from './dto/filter-posts-query.dto';
import { FeedFilterEnum } from '../common/types/feed-filter.enum';

type AnyFn = (...args: any[]) => any;

const createQueryBuilderMock = (rows: unknown[] = [], count = 0) => {
  const qb: Record<string, jest.Mock<AnyFn>> = {};

  for (const method of [
    'select',
    'addSelect',
    'where',
    'andWhere',
    'leftJoin',
    'groupBy',
    'orderBy',
    'addOrderBy',
    'offset',
    'limit',
  ]) {
    qb[method] = jest.fn<AnyFn>().mockReturnValue(qb);
  }

  qb.getRawMany = jest.fn<AnyFn>().mockResolvedValue(rows);
  qb.getCount = jest.fn<AnyFn>().mockResolvedValue(count);

  return qb;
};

const buildPost = (id: string, extra: Record<string, unknown> = {}) =>
  ({
    id,
    caption: `caption ${id}`,
    postType: PostTypeEnum.COMMUNITY,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    userId: {
      id: 'author-1',
      username: 'ana',
      profilePicture: 'ana.jpg',
      role: UserRoleEnum.USER,
      password: 'secret',
      email: 'ana@mail.com',
    },
    images: [{ id: 1, url: 'img.jpg', isCover: true }],
    ...extra,
  }) as unknown as PostEntity;

void describe('PostsServiceTest', () => {
  let service: PostsService;

  const postsRepositoryMock = {
    findAndCount: jest.fn<(options: any) => Promise<[PostEntity[], number]>>(),
    find: jest.fn<(options: any) => Promise<PostEntity[]>>(),
    findOne: jest.fn<(options: any) => Promise<PostEntity | null>>(),
    exists: jest.fn<(options: any) => Promise<boolean>>(),
    createQueryBuilder: jest.fn<AnyFn>(),
  };

  const likesRepositoryMock = {
    find: jest.fn<(options: any) => Promise<UserLikesEntity[]>>(),
    findOne: jest.fn<(options: any) => Promise<UserLikesEntity | null>>(),
    create: jest.fn<(data: Partial<UserLikesEntity>) => UserLikesEntity>(),
    save: jest.fn<(like: UserLikesEntity) => Promise<UserLikesEntity>>(),
    remove: jest.fn<(like: UserLikesEntity) => Promise<UserLikesEntity>>(),
    count: jest.fn<(options: any) => Promise<number>>(),
    createQueryBuilder: jest.fn<AnyFn>(),
  };

  const mockLikes = (
    counts: { postId: string; count: string }[],
    likedPostIds: string[],
  ) => {
    likesRepositoryMock.createQueryBuilder.mockReturnValue(
      createQueryBuilderMock(counts),
    );
    likesRepositoryMock.find.mockResolvedValue(
      likedPostIds.map(
        (postId) => ({ userId: 'viewer', postId }) as UserLikesEntity,
      ),
    );
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: postsRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserLikesEntity),
          useValue: likesRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(PostsService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the paginated feed with likes info and public author data', async () => {
    postsRepositoryMock.findAndCount.mockResolvedValue([[buildPost('p1')], 1]);
    mockLikes([{ postId: 'p1', count: '3' }], ['p1']);

    const result = await service.findAll('viewer', new PaginationQueryDto());

    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: 'p1',
        likesCount: 3,
        likedByMe: true,
        garment: null,
        event: null,
      }),
    );
    expect(result.data[0].author).toEqual({
      id: 'author-1',
      username: 'ana',
      profilePicture: 'ana.jpg',
      role: UserRoleEnum.USER,
    });
    expect(result.data[0].author).not.toHaveProperty('password');
    expect(result.data[0].author).not.toHaveProperty('email');
  });

  it('uses zero likes and likedByMe false when nobody liked the post', async () => {
    postsRepositoryMock.findAndCount.mockResolvedValue([[buildPost('p1')], 1]);
    mockLikes([], []);

    const result = await service.findAll('viewer', new PaginationQueryDto());

    expect(result.data[0].likesCount).toBe(0);
    expect(result.data[0].likedByMe).toBe(false);
  });

  it('applies pagination to the feed', async () => {
    const query = Object.assign(new PaginationQueryDto(), {
      page: 3,
      limit: 5,
    });

    postsRepositoryMock.findAndCount.mockResolvedValue([[], 12]);

    const result = await service.findAll('viewer', query);

    expect(postsRepositoryMock.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 }),
    );
    expect(result.meta).toEqual({
      page: 3,
      limit: 5,
      total: 12,
      totalPages: 3,
    });
  });

  it('returns an empty page without querying likes', async () => {
    postsRepositoryMock.findAndCount.mockResolvedValue([[], 0]);

    const result = await service.findAll('viewer', new PaginationQueryDto());

    expect(result.data).toEqual([]);
    expect(likesRepositoryMock.createQueryBuilder).not.toHaveBeenCalled();
  });
});
