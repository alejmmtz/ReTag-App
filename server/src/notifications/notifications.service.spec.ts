import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { NotificationsService } from './notifications.service';
import { NotificationTypeEnum } from '../common/types/notification-type.enum';
import { UserEntity } from '../users/entities/user.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { FollowEntity } from '../users/entities/follow.entity';
import { BagEntity } from '../bags/entities/bag.entity';
import { PaginationQueryDto } from '../users/dto/pagination-query.dto';

void describe('NotificationsServiceTest', () => {
  let service: NotificationsService;

  const likesRepositoryMock = {
    findAndCount:
      jest.fn<(options: any) => Promise<[UserLikesEntity[], number]>>(),
  };
  const followsRepositoryMock = {
    findAndCount:
      jest.fn<(options: any) => Promise<[FollowEntity[], number]>>(),
  };
  const bagsRepositoryMock = {
    findAndCount: jest.fn<(options: any) => Promise<[BagEntity[], number]>>(),
  };

  const buildUser = (id: string, username: string) =>
    ({
      id,
      username,
      profilePicture: `${username}.jpg`,
      password: 'secret',
      email: `${username}@mail.com`,
    }) as UserEntity;

  const likeMock = {
    postId: 'post-1',
    createdAt: new Date('2026-01-02T10:00:00Z'),
    user: buildUser('u2', 'ana'),
  } as UserLikesEntity;

  const followMock = {
    createdAt: new Date('2026-01-03T10:00:00Z'),
    follower: buildUser('u3', 'luis'),
  } as FollowEntity;

  const bagMock = {
    garmentId: 'garment-1',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    user: buildUser('u4', 'maria'),
  } as BagEntity;

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(UserLikesEntity),
          useValue: likesRepositoryMock,
        },
        {
          provide: getRepositoryToken(FollowEntity),
          useValue: followsRepositoryMock,
        },
        {
          provide: getRepositoryToken(BagEntity),
          useValue: bagsRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('merges likes, follows and bags sorted from newest to oldest', async () => {
    likesRepositoryMock.findAndCount.mockResolvedValue([[likeMock], 1]);
    followsRepositoryMock.findAndCount.mockResolvedValue([[followMock], 1]);
    bagsRepositoryMock.findAndCount.mockResolvedValue([[bagMock], 1]);

    const result = await service.findAll('1', new PaginationQueryDto());

    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 3,
      totalPages: 1,
    });
    expect(result.data.map((n) => n.type)).toEqual([
      NotificationTypeEnum.FOLLOW,
      NotificationTypeEnum.LIKE,
      NotificationTypeEnum.BAG,
    ]);
    expect(result.data[1]).toEqual(
      expect.objectContaining({ postId: 'post-1' }),
    );
    expect(result.data[2]).toEqual(
      expect.objectContaining({ garmentId: 'garment-1' }),
    );
  });

  it('only exposes public data of the user who triggered the notification', async () => {
    likesRepositoryMock.findAndCount.mockResolvedValue([[likeMock], 1]);
    followsRepositoryMock.findAndCount.mockResolvedValue([[], 0]);
    bagsRepositoryMock.findAndCount.mockResolvedValue([[], 0]);

    const result = await service.findAll('1', new PaginationQueryDto());

    expect(result.data[0].actor).toEqual({
      id: 'u2',
      username: 'ana',
      profilePicture: 'ana.jpg',
    });
    expect(result.data[0].actor).not.toHaveProperty('password');
    expect(result.data[0].actor).not.toHaveProperty('email');
  });

  it('paginates the merged notifications', async () => {
    const query = Object.assign(new PaginationQueryDto(), {
      page: 2,
      limit: 1,
    });

    likesRepositoryMock.findAndCount.mockResolvedValue([[likeMock], 1]);
    followsRepositoryMock.findAndCount.mockResolvedValue([[followMock], 1]);
    bagsRepositoryMock.findAndCount.mockResolvedValue([[bagMock], 1]);

    const result = await service.findAll('1', query);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].type).toBe(NotificationTypeEnum.LIKE);
    expect(result.meta).toEqual({
      page: 2,
      limit: 1,
      total: 3,
      totalPages: 3,
    });
    expect(followsRepositoryMock.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ take: 2 }),
    );
  });

  it('returns an empty list when the user has no notifications', async () => {
    likesRepositoryMock.findAndCount.mockResolvedValue([[], 0]);
    followsRepositoryMock.findAndCount.mockResolvedValue([[], 0]);
    bagsRepositoryMock.findAndCount.mockResolvedValue([[], 0]);

    const result = await service.findAll('1', new PaginationQueryDto());

    expect(result).toEqual({
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  });
});
