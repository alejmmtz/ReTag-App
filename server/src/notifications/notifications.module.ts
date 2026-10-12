import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { FollowEntity } from '../users/entities/follow.entity';
import { BagEntity } from '../bags/entities/bag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLikesEntity, FollowEntity, BagEntity]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
