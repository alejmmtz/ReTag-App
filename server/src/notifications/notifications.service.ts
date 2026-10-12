import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { FollowEntity } from '../users/entities/follow.entity';
import { BagEntity } from '../bags/entities/bag.entity';
import { PaginationQueryDto } from '../users/dto/pagination-query.dto';
import { paginate } from '../common/utils/paginate';
import { NotificationTypeEnum } from '../common/types/notification-type.enum';

export interface NotificationItem {
  type: NotificationTypeEnum;
  createdAt: Date;
  actor: {
    id: string;
    username: string;
    profilePicture: string;
  };
  postId?: string;
  garmentId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(UserLikesEntity)
    private readonly likesRepository: Repository<UserLikesEntity>,

    @InjectRepository(FollowEntity)
    private readonly followsRepository: Repository<FollowEntity>,

    @InjectRepository(BagEntity)
    private readonly bagsRepository: Repository<BagEntity>,
  ) {}

  async findAll(userId: string, query: PaginationQueryDto) {
    const { page, limit } = query;
    const take = page * limit;

    const [[likes, likesTotal], [follows, followsTotal], [bags, bagsTotal]] =
      await Promise.all([
        this.likesRepository.findAndCount({
          where: { post: { userId: { id: userId } }, userId: Not(userId) },
          relations: { user: true },
          order: { createdAt: 'DESC' },
          take,
        }),
        this.followsRepository.findAndCount({
          where: { followedId: userId },
          relations: { follower: true },
          order: { createdAt: 'DESC' },
          take,
        }),
        this.bagsRepository.findAndCount({
          where: { garment: { seller: { id: userId } }, userId: Not(userId) },
          relations: { user: true },
          order: { createdAt: 'DESC' },
          take,
        }),
      ]);

    const notifications: NotificationItem[] = [
      ...likes.map((like) => ({
        type: NotificationTypeEnum.LIKE,
        createdAt: like.createdAt,
        actor: this.toActor(like.user),
        postId: like.postId,
      })),
      ...follows.map((follow) => ({
        type: NotificationTypeEnum.FOLLOW,
        createdAt: follow.createdAt,
        actor: this.toActor(follow.follower),
      })),
      ...bags.map((bag) => ({
        type: NotificationTypeEnum.BAG,
        createdAt: bag.createdAt,
        actor: this.toActor(bag.user),
        garmentId: bag.garmentId,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * limit, page * limit);

    return paginate(
      notifications,
      likesTotal + followsTotal + bagsTotal,
      page,
      limit,
    );
  }

  private toActor(user: UserEntity) {
    return {
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
    };
  }
}
