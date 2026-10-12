import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PostsService } from './posts.service';
import { PostEntity } from './entities/post.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { PostTypeEnum, UserRoleEnum } from '../common/types/enums';
import { UNDERGROUND_MAX_FOLLOWERS } from './posts.constants';
import { FilterPostsQueryDto } from './dto/filter-posts-query.dto';
import { FeedFilterEnum } from '../common/types/feed-filter.enum';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FollowEntity } from '../users/entities/follow.entity';
import { DataSource } from 'typeorm';
import { PostImageEntity } from './entities/post-image.entity';
import { UserEntity } from '../users/entities/user.entity';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { EventEntity } from '../events/entities/event.entity';
import { EventParticipantEntity } from '../events/entities/event-participant.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDetailResponse } from '../common/types/post-response.type';

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

  const followsRepositoryMock = {
    exists: jest.fn<(options: any) => Promise<boolean>>(),
  };
  const usersRepositoryMock = {
    findOne: jest.fn<(options: any) => Promise<UserEntity | null>>(),
  };

  const garmentsRepositoryMock = {
    findOne: jest.fn<(options: any) => Promise<GarmentEntity | null>>(),
  };

  const eventsRepositoryMock = {
    findOne: jest.fn<(options: any) => Promise<EventEntity | null>>(),
  };

  const eventParticipantsRepositoryMock = {
    exists: jest.fn<(options: any) => Promise<boolean>>(),
  };

  const managerMock = {
    save: jest.fn<AnyFn>(),
    update: jest.fn<AnyFn>(),
    remove: jest.fn<AnyFn>(),
    delete: jest.fn<AnyFn>(),
  };

  const dataSourceMock = {
    transaction: jest.fn<AnyFn>(),
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
    dataSourceMock.transaction.mockImplementation(
      (callback: (manager: typeof managerMock) => Promise<unknown>) =>
        callback(managerMock),
    );

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
        {
          provide: getRepositoryToken(FollowEntity),
          useValue: followsRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: usersRepositoryMock,
        },
        {
          provide: getRepositoryToken(GarmentEntity),
          useValue: garmentsRepositoryMock,
        },
        {
          provide: getRepositoryToken(EventEntity),
          useValue: eventsRepositoryMock,
        },
        {
          provide: getRepositoryToken(EventParticipantEntity),
          useValue: eventParticipantsRepositoryMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = moduleRef.get(PostsService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  const feedQuery = (overrides: Partial<FilterPostsQueryDto> = {}) =>
    Object.assign(new FilterPostsQueryDto(), overrides);

  const mockFeed = (ids: string[], total = ids.length) => {
    const idsQb = createQueryBuilderMock(ids.map((id) => ({ id })));
    const countQb = createQueryBuilderMock([], total);

    postsRepositoryMock.createQueryBuilder
      .mockReturnValueOnce(idsQb)
      .mockReturnValueOnce(countQb);

    return { idsQb, countQb };
  };

  it('for you (default): excludes own posts, ranks by score and keeps the ranking order', async () => {
    const { idsQb } = mockFeed(['p2', 'p1']);
    postsRepositoryMock.find.mockResolvedValue([
      buildPost('p1'),
      buildPost('p2'),
    ]);
    mockLikes([{ postId: 'p2', count: '4' }], ['p2']);

    const result = await service.findAll('viewer', feedQuery());

    expect(idsQb.andWhere).toHaveBeenCalledWith('post.user_id <> :viewerId', {
      viewerId: 'viewer',
    });
    expect(idsQb.leftJoin).toHaveBeenCalledWith('post.likes', 'postLike');
    expect(idsQb.orderBy).toHaveBeenCalledWith('score', 'DESC');
    expect(result.data.map((post) => post.id)).toEqual(['p2', 'p1']);
    expect(result.data[0]).toEqual(
      expect.objectContaining({ likesCount: 4, likedByMe: true }),
    );
    expect(result.meta.total).toBe(2);
  });

  it('following: only posts from followed authors, newest first', async () => {
    const { idsQb } = mockFeed(['p1']);
    postsRepositoryMock.find.mockResolvedValue([buildPost('p1')]);
    mockLikes([], []);

    await service.findAll(
      'viewer',
      feedQuery({ feed: FeedFilterEnum.FOLLOWING }),
    );

    expect(idsQb.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('FROM follows f WHERE f.follower_id = :viewerId'),
      { viewerId: 'viewer' },
    );
    expect(idsQb.orderBy).toHaveBeenCalledWith('post.createdAt', 'DESC');
    expect(idsQb.leftJoin).not.toHaveBeenCalled();
  });

  it('underground: posts from authors with few followers, excluding own posts', async () => {
    const { idsQb } = mockFeed(['p1']);
    postsRepositoryMock.find.mockResolvedValue([buildPost('p1')]);
    mockLikes([], []);

    await service.findAll(
      'viewer',
      feedQuery({ feed: FeedFilterEnum.UNDERGROUND }),
    );

    expect(idsQb.andWhere).toHaveBeenCalledWith('post.user_id <> :viewerId', {
      viewerId: 'viewer',
    });
    expect(idsQb.andWhere).toHaveBeenCalledWith(
      expect.stringContaining(
        'FROM follows f WHERE f.followed_id = post.user_id',
      ),
      { threshold: UNDERGROUND_MAX_FOLLOWERS },
    );
    expect(idsQb.orderBy).toHaveBeenCalledWith('post.createdAt', 'DESC');
  });

  it('applies the category filter to both the page and the total', async () => {
    const { idsQb, countQb } = mockFeed(['p1']);
    postsRepositoryMock.find.mockResolvedValue([buildPost('p1')]);
    mockLikes([], []);

    await service.findAll(
      'viewer',
      feedQuery({ feed: FeedFilterEnum.FOLLOWING, type: PostTypeEnum.OFFER }),
    );

    expect(idsQb.andWhere).toHaveBeenCalledWith('post.postType = :type', {
      type: PostTypeEnum.OFFER,
    });
    expect(countQb.andWhere).toHaveBeenCalledWith('post.postType = :type', {
      type: PostTypeEnum.OFFER,
    });
  });

  it('applies pagination to the feed', async () => {
    const { idsQb } = mockFeed([], 12);

    const result = await service.findAll(
      'viewer',
      feedQuery({ page: 3, limit: 5 }),
    );

    expect(idsQb.offset).toHaveBeenCalledWith(10);
    expect(idsQb.limit).toHaveBeenCalledWith(5);
    expect(result.meta).toEqual({
      page: 3,
      limit: 5,
      total: 12,
      totalPages: 3,
    });
  });

  it('returns an empty page without loading posts or likes', async () => {
    mockFeed([], 0);

    const result = await service.findAll('viewer', feedQuery());

    expect(result.data).toEqual([]);
    expect(postsRepositoryMock.find).not.toHaveBeenCalled();
    expect(likesRepositoryMock.createQueryBuilder).not.toHaveBeenCalled();
  });
  it('returns the post detail with likes and follow state', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(buildPost('p1'));
    mockLikes([{ postId: 'p1', count: '2' }], []);
    followsRepositoryMock.exists.mockResolvedValue(true);

    const result = await service.findOne('viewer', 'p1');

    expect(result).toEqual(
      expect.objectContaining({
        id: 'p1',
        likesCount: 2,
        likedByMe: false,
        isFollowingAuthor: true,
      }),
    );
    expect(followsRepositoryMock.exists).toHaveBeenCalledWith({
      where: { followerId: 'viewer', followedId: 'author-1' },
    });
  });

  it('includes the garment and event references in the detail', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(
      buildPost('p1', {
        garmentId: {
          id: 'g1',
          name: 'Chaqueta',
          price: '45000.00',
          status: 'available',
        },
        eventId: { id: 'e1', title: 'Swap', startsAt: new Date('2026-02-01') },
      }),
    );
    mockLikes([], []);
    followsRepositoryMock.exists.mockResolvedValue(false);

    const result = await service.findOne('viewer', 'p1');

    expect(result.garment).toEqual({
      id: 'g1',
      name: 'Chaqueta',
      price: 45000,
      status: 'available',
    });
    expect(result.event).toEqual(
      expect.objectContaining({ id: 'e1', title: 'Swap' }),
    );
  });

  it('throws NotFoundException when the post does not exist', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne('viewer', 'p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a like and returns the new count', async () => {
    postsRepositoryMock.exists.mockResolvedValue(true);
    likesRepositoryMock.findOne.mockResolvedValue(null);
    likesRepositoryMock.create.mockReturnValue({
      userId: 'viewer',
      postId: 'p1',
    } as UserLikesEntity);
    likesRepositoryMock.save.mockResolvedValue({} as UserLikesEntity);
    likesRepositoryMock.count.mockResolvedValue(4);

    const result = await service.like('viewer', 'p1');

    expect(result).toEqual({ postId: 'p1', liked: true, likesCount: 4 });
    expect(likesRepositoryMock.create).toHaveBeenCalledWith({
      userId: 'viewer',
      postId: 'p1',
    });
    expect(likesRepositoryMock.save).toHaveBeenCalled();
  });

  it('throws NotFoundException when liking a post that does not exist', async () => {
    postsRepositoryMock.exists.mockResolvedValue(false);

    await expect(service.like('viewer', 'p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(likesRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when the post is already liked', async () => {
    postsRepositoryMock.exists.mockResolvedValue(true);
    likesRepositoryMock.findOne.mockResolvedValue({
      userId: 'viewer',
      postId: 'p1',
    } as UserLikesEntity);

    await expect(service.like('viewer', 'p1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(likesRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('removes the like and returns the new count', async () => {
    const likeMock = { userId: 'viewer', postId: 'p1' } as UserLikesEntity;

    likesRepositoryMock.findOne.mockResolvedValue(likeMock);
    likesRepositoryMock.remove.mockResolvedValue(likeMock);
    likesRepositoryMock.count.mockResolvedValue(1);

    const result = await service.unlike('viewer', 'p1');

    expect(result).toEqual({ postId: 'p1', liked: false, likesCount: 1 });
    expect(likesRepositoryMock.remove).toHaveBeenCalledWith(likeMock);
  });

  it('throws NotFoundException when removing a like that does not exist', async () => {
    likesRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.unlike('viewer', 'p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(likesRepositoryMock.remove).not.toHaveBeenCalled();
  });
  const detailMock = { id: 'new-post' } as PostDetailResponse;

  const buildDto = (overrides: Partial<CreatePostDto> = {}) =>
    Object.assign(new CreatePostDto(), {
      caption: 'hola',
      postType: PostTypeEnum.COMMUNITY,
      ...overrides,
    });

  const mockUser = (role: UserRoleEnum) =>
    usersRepositoryMock.findOne.mockResolvedValue({
      id: 'user-1',
      role,
    } as UserEntity);

  const mockSavedPost = () => {
    managerMock.save
      .mockResolvedValueOnce({ id: 'new-post' })
      .mockResolvedValue([]);

    return jest.spyOn(service, 'findOne').mockResolvedValue(detailMock);
  };

  it('creates a community post with its images in one transaction', async () => {
    mockUser(UserRoleEnum.USER);
    const findOneSpy = mockSavedPost();

    const result = await service.create(
      'user-1',
      buildDto({ images: ['a.jpg', 'b.jpg'] }),
    );

    expect(result).toEqual(detailMock);
    expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);
    expect(managerMock.save).toHaveBeenNthCalledWith(
      1,
      PostEntity,
      expect.objectContaining({
        caption: 'hola',
        postType: PostTypeEnum.COMMUNITY,
        userId: { id: 'user-1' },
      }),
    );
    expect(managerMock.save).toHaveBeenNthCalledWith(2, PostImageEntity, [
      { url: 'a.jpg', isCover: true, post: { id: 'new-post' } },
      { url: 'b.jpg', isCover: false, post: { id: 'new-post' } },
    ]);
    expect(findOneSpy).toHaveBeenCalledWith('user-1', 'new-post');
  });

  it('creates an offer post linked to a garment of the closet', async () => {
    mockUser(UserRoleEnum.USER);
    mockSavedPost();
    garmentsRepositoryMock.findOne.mockResolvedValue({
      id: 'g1',
    } as GarmentEntity);

    await service.create(
      'user-1',
      buildDto({ postType: PostTypeEnum.OFFER, garmentId: 'g1' }),
    );

    expect(garmentsRepositoryMock.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'g1', seller: { id: 'user-1' } },
      }),
    );
    expect(managerMock.save).toHaveBeenNthCalledWith(
      1,
      PostEntity,
      expect.objectContaining({ garmentId: { id: 'g1' } }),
    );
  });

  it('throws NotFoundException when the user does not exist', async () => {
    usersRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.create('user-1', buildDto())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when a store publishes a community post (RF-23)', async () => {
    mockUser(UserRoleEnum.STORE);

    await expect(service.create('user-1', buildDto())).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(dataSourceMock.transaction).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when a regular user publishes an event post', async () => {
    mockUser(UserRoleEnum.USER);

    await expect(
      service.create(
        'user-1',
        buildDto({ postType: PostTypeEnum.EVENT, eventId: 'e1' }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws BadRequestException when an offer post has no garment', async () => {
    mockUser(UserRoleEnum.USER);

    await expect(
      service.create('user-1', buildDto({ postType: PostTypeEnum.OFFER })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when an event post has no event', async () => {
    mockUser(UserRoleEnum.STORE);

    await expect(
      service.create('user-1', buildDto({ postType: PostTypeEnum.EVENT })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when a community post references a garment', async () => {
    mockUser(UserRoleEnum.USER);

    await expect(
      service.create('user-1', buildDto({ garmentId: 'g1' })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when the garment is not in the closet of the user', async () => {
    mockUser(UserRoleEnum.USER);
    garmentsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        'user-1',
        buildDto({ postType: PostTypeEnum.OFFER, garmentId: 'g1' }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(dataSourceMock.transaction).not.toHaveBeenCalled();
  });

  it('lets a store publish an event post for its own event', async () => {
    mockUser(UserRoleEnum.STORE);
    mockSavedPost();
    eventsRepositoryMock.findOne.mockResolvedValue({
      id: 'e1',
      store: { userId: 'user-1' },
    } as EventEntity);

    await service.create(
      'user-1',
      buildDto({ postType: PostTypeEnum.EVENT, eventId: 'e1' }),
    );

    expect(managerMock.save).toHaveBeenNthCalledWith(
      1,
      PostEntity,
      expect.objectContaining({
        eventId: expect.objectContaining({ id: 'e1' }),
      }),
    );
  });

  it('throws ForbiddenException when a store links a post to an event of another store', async () => {
    mockUser(UserRoleEnum.STORE);
    eventsRepositoryMock.findOne.mockResolvedValue({
      id: 'e1',
      store: { userId: 'other-store' },
    } as EventEntity);

    await expect(
      service.create(
        'user-1',
        buildDto({ postType: PostTypeEnum.EVENT, eventId: 'e1' }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets an active participant publish a show off post about the event (RF-17)', async () => {
    mockUser(UserRoleEnum.USER);
    mockSavedPost();
    eventsRepositoryMock.findOne.mockResolvedValue({
      id: 'e1',
      store: { userId: 'store-1' },
    } as EventEntity);
    eventParticipantsRepositoryMock.exists.mockResolvedValue(true);

    await service.create(
      'user-1',
      buildDto({ postType: PostTypeEnum.SHOWOFF, eventId: 'e1' }),
    );

    expect(eventParticipantsRepositoryMock.exists).toHaveBeenCalledWith({
      where: { eventId: 'e1', userId: 'user-1', status: 'active' },
    });
    expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);
  });

  it('throws ForbiddenException when the user does not participate in the event', async () => {
    mockUser(UserRoleEnum.USER);
    eventsRepositoryMock.findOne.mockResolvedValue({
      id: 'e1',
      store: { userId: 'store-1' },
    } as EventEntity);
    eventParticipantsRepositoryMock.exists.mockResolvedValue(false);

    await expect(
      service.create(
        'user-1',
        buildDto({ postType: PostTypeEnum.SHOWOFF, eventId: 'e1' }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws NotFoundException when the event does not exist', async () => {
    mockUser(UserRoleEnum.USER);
    eventsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        'user-1',
        buildDto({ postType: PostTypeEnum.SHOWOFF, eventId: 'e1' }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  const ownedPost = buildPost('p1', {
    userId: { id: 'user-1' },
    images: [{ id: 7, url: 'old.jpg', isCover: true }],
  });

  it('updates the caption of an own post', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(ownedPost);
    jest.spyOn(service, 'findOne').mockResolvedValue(detailMock);

    const result = await service.update('user-1', 'p1', { caption: 'nuevo' });

    expect(result).toEqual(detailMock);
    expect(managerMock.update).toHaveBeenCalledWith(
      PostEntity,
      { id: 'p1' },
      { caption: 'nuevo' },
    );
    expect(managerMock.remove).not.toHaveBeenCalled();
  });

  it('replaces the images of an own post', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(ownedPost);
    jest.spyOn(service, 'findOne').mockResolvedValue(detailMock);

    await service.update('user-1', 'p1', { images: ['new.jpg'] });

    expect(managerMock.remove).toHaveBeenCalledWith(
      PostImageEntity,
      ownedPost.images,
    );
    expect(managerMock.save).toHaveBeenCalledWith(PostImageEntity, [
      { url: 'new.jpg', isCover: true, post: { id: 'p1' } },
    ]);
    expect(managerMock.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when updating a post that does not exist', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.update('user-1', 'p1', { caption: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(dataSourceMock.transaction).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when updating a post of another user', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(
      buildPost('p1', { userId: { id: 'someone-else' } }),
    );

    await expect(
      service.update('user-1', 'p1', { caption: 'x' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(dataSourceMock.transaction).not.toHaveBeenCalled();
  });

  it('deletes an own post together with its likes and images', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(ownedPost);

    const result = await service.remove('user-1', 'p1');

    expect(result).toEqual({ message: 'Post deleted successfully' });
    expect(managerMock.delete).toHaveBeenCalledWith(UserLikesEntity, {
      postId: 'p1',
    });
    expect(managerMock.remove).toHaveBeenCalledWith(
      PostImageEntity,
      ownedPost.images,
    );
    expect(managerMock.delete).toHaveBeenCalledWith(PostEntity, { id: 'p1' });
  });

  it('throws NotFoundException when deleting a post that does not exist', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.remove('user-1', 'p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when deleting a post of another user', async () => {
    postsRepositoryMock.findOne.mockResolvedValue(
      buildPost('p1', { userId: { id: 'someone-else' } }),
    );

    await expect(service.remove('user-1', 'p1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(dataSourceMock.transaction).not.toHaveBeenCalled();
  });
});
