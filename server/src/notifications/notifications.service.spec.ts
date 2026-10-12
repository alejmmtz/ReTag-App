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
});
