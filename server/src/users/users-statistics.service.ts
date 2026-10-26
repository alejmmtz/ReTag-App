import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PostEntity } from '../posts/entities/post.entity';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { BagEntity } from '../bags/entities/bag.entity';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { FollowEntity } from './entities/follow.entity';
import { UserLikesEntity } from './entities/user-like.entity';
import { GarmentStatus, TransactionStatusEnum } from '../common/types/enums';

@Injectable()
export class UsersStatisticsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,

    @InjectRepository(GarmentEntity)
    private readonly garmentsRepository: Repository<GarmentEntity>,

    @InjectRepository(FollowEntity)
    private readonly followsRepository: Repository<FollowEntity>,

    @InjectRepository(UserLikesEntity)
    private readonly likesRepository: Repository<UserLikesEntity>,

    @InjectRepository(BagEntity)
    private readonly bagsRepository: Repository<BagEntity>,

    @InjectRepository(TransactionEntity)
    private readonly transactionsRepository: Repository<TransactionEntity>,
  ) {}

  async getStatistics(userId: string) {
    const countGarments = (status: GarmentStatus) =>
      this.garmentsRepository.count({
        where: { seller: { id: userId }, status },
      });

    const [
      posts,
      available,
      traded,
      purchased,
      waterSaved,
      followers,
      following,
      likesReceived,
      bagsReceived,
      transactionsMade,
      transactionsReceived,
      transactionsCompleted,
    ] = await Promise.all([
      this.postsRepository.count({ where: { userId: { id: userId } } }),
      countGarments(GarmentStatus.AVAILABLE),
      countGarments(GarmentStatus.TRADED),
      countGarments(GarmentStatus.PURCHASED),
      this.garmentsRepository.sum('waterSaved', { seller: { id: userId } }),
      this.followsRepository.count({ where: { followedId: userId } }),
      this.followsRepository.count({ where: { followerId: userId } }),
      this.likesRepository.count({
        where: { post: { userId: { id: userId } }, userId: Not(userId) },
      }),
      this.bagsRepository.count({
        where: { garment: { seller: { id: userId } }, userId: Not(userId) },
      }),
      this.transactionsRepository.count({ where: { buyerId: userId } }),
      this.transactionsRepository.count({
        where: { garment: { seller: { id: userId } } },
      }),
      this.transactionsRepository.count({
        where: [
          { buyerId: userId, status: TransactionStatusEnum.COMPLETED },
          {
            garment: { seller: { id: userId } },
            status: TransactionStatusEnum.COMPLETED,
          },
        ],
      }),
    ]);

    return {
      posts,
      garments: {
        total: available + traded + purchased,
        available,
        traded,
        purchased,
      },
      community: {
        followers,
        following,
        likesReceived,
        bagsReceived,
      },
      transactions: {
        made: transactionsMade,
        received: transactionsReceived,
        completed: transactionsCompleted,
      },
      environment: {
        waterSaved: waterSaved ?? 0,
      },
    };
  }
}
