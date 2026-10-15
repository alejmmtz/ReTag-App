import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostImageEntity } from './entities/post-image.entity';
import { UserLikesEntity } from '../users/entities/user-like.entity';
import { FollowEntity } from '../users/entities/follow.entity';
import { UserEntity } from '../users/entities/user.entity';
import { GarmentEntity } from '../garments/entities/garment.entity';
import { EventEntity } from '../events/entities/event.entity';
import { EventParticipantEntity } from '../events/entities/event-participant.entity';
import { EventPostsController } from './event-posts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      PostImageEntity,
      UserLikesEntity,
      FollowEntity,
      UserEntity,
      GarmentEntity,
      EventEntity,
      EventParticipantEntity,
    ]),
  ],
  controllers: [PostsController, EventPostsController],
  providers: [PostsService],
})
export class PostsModule {}
