import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserLikesEntity } from './entities/user-like.entity';
import { FollowEntity } from './entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserLikesEntity, FollowEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
