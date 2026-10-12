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
}
