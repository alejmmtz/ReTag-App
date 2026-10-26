import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersStatisticsService } from './users-statistics.service';
import { FollowEntity } from './entities/follow.entity';
import { UserLikesEntity } from './entities/user-like.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { BagEntity } from '../bags/entities/bag.entity';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { GarmentStatus } from '../common/types/enums';

type CountOptions = {
  where: Record<string, unknown> | Array<Record<string, unknown>>;
};
type CountFn = (options: CountOptions) => Promise<number>;

void describe('UsersStatisticsServiceTest', () => {
  let service: UsersStatisticsService;

  const postsRepositoryMock = { count: jest.fn<CountFn>() };
  const garmentsRepositoryMock = {
    count: jest.fn<CountFn>(),
    sum: jest.fn<(column: string, where: any) => Promise<number | null>>(),
  };
  const followsRepositoryMock = { count: jest.fn<CountFn>() };
  const likesRepositoryMock = { count: jest.fn<CountFn>() };
  const bagsRepositoryMock = { count: jest.fn<CountFn>() };
  const transactionsRepositoryMock = { count: jest.fn<CountFn>() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersStatisticsService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: postsRepositoryMock,
        },
        {
          provide: getRepositoryToken(GarmentEntity),
          useValue: garmentsRepositoryMock,
        },
        {
          provide: getRepositoryToken(FollowEntity),
          useValue: followsRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserLikesEntity),
          useValue: likesRepositoryMock,
        },
        {
          provide: getRepositoryToken(BagEntity),
          useValue: bagsRepositoryMock,
        },
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: transactionsRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(UsersStatisticsService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the activity statistics of the user', async () => {
    postsRepositoryMock.count.mockResolvedValue(6);

    const garmentsByStatus: Record<string, number> = {
      [GarmentStatus.AVAILABLE]: 4,
      [GarmentStatus.TRADED]: 2,
      [GarmentStatus.PURCHASED]: 1,
    };
    garmentsRepositoryMock.count.mockImplementation((options) =>
      Promise.resolve(
        garmentsByStatus[
          (options.where as Record<string, unknown>).status as string
        ],
      ),
    );
    garmentsRepositoryMock.sum.mockResolvedValue(125.5);

    followsRepositoryMock.count.mockImplementation((options) =>
      Promise.resolve(
        'followedId' in (options.where as Record<string, unknown>) ? 10 : 3,
      ),
    );
    likesRepositoryMock.count.mockResolvedValue(25);
    bagsRepositoryMock.count.mockResolvedValue(8);
    transactionsRepositoryMock.count.mockImplementation((options) =>
      Promise.resolve(
        Array.isArray(options.where) ? 2 : 'buyerId' in options.where ? 5 : 3,
      ),
    );

    const result = await service.getStatistics('1');

    expect(result).toEqual({
      posts: 6,
      garments: { total: 7, available: 4, traded: 2, purchased: 1 },
      community: {
        followers: 10,
        following: 3,
        likesReceived: 25,
        bagsReceived: 8,
      },
      transactions: { made: 5, received: 3, completed: 2 },
      environment: { waterSaved: 125.5 },
    });
  });

  it('returns zeros for a user without activity', async () => {
    postsRepositoryMock.count.mockResolvedValue(0);
    garmentsRepositoryMock.count.mockResolvedValue(0);
    garmentsRepositoryMock.sum.mockResolvedValue(null);
    followsRepositoryMock.count.mockResolvedValue(0);
    likesRepositoryMock.count.mockResolvedValue(0);
    bagsRepositoryMock.count.mockResolvedValue(0);
    transactionsRepositoryMock.count.mockResolvedValue(0);

    const result = await service.getStatistics('1');

    expect(result).toEqual({
      posts: 0,
      garments: { total: 0, available: 0, traded: 0, purchased: 0 },
      community: {
        followers: 0,
        following: 0,
        likesReceived: 0,
        bagsReceived: 0,
      },
      transactions: { made: 0, received: 0, completed: 0 },
      environment: { waterSaved: 0 },
    });
  });
});
