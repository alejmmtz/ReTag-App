import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserLikesEntity } from './entities/user-like.entity';
import { FollowEntity } from './entities/follow.entity';
import { BagEntity } from '../bags/entities/bag.entity';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { UsersStatisticsService } from './users-statistics.service';
import { UsersStatisticsController } from './users-statistics.controller';
import { AuthModule } from '../auth/auth.module';
import { GarmentsModule } from '../garments/garments.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    AuthModule,
    GarmentsModule,
    PostsModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserLikesEntity,
      FollowEntity,
      BagEntity,
      TransactionEntity,
    ]),
  ],
  controllers: [UsersController, UsersStatisticsController],
  providers: [UsersService, UsersStatisticsService],
})
export class UsersModule {}
