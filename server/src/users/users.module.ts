import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserLikesEntity } from './entities/user-like.entity';
import { FollowEntity } from './entities/follow.entity';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { BagEntity } from '../bags/entities/bag.entity';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { UsersStatisticsService } from './users-statistics.service';
import { UsersStatisticsController } from './users-statistics.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserLikesEntity,
      FollowEntity,
      GarmentEntity,
      PostEntity,
      BagEntity,
      TransactionEntity,
    ]),
  ],
  controllers: [UsersController, UsersStatisticsController],
  providers: [UsersService, UsersStatisticsService],
})
export class UsersModule {}
