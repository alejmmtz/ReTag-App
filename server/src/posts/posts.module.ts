import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostImageEntity } from './entities/post-image.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { FollowEntity } from '../users/entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      PostImageEntity,
      UserLikesEntity,
      FollowEntity,
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
