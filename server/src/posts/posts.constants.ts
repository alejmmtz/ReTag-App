import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { PostEntity } from './entities/post.entity';

export const POST_RELATIONS: FindOptionsRelations<PostEntity> = {
  userId: true,
  garmentId: true,
  eventId: true,
  images: true,
};

export const POST_SELECT: FindOptionsSelect<PostEntity> = {
  id: true,
  caption: true,
  postType: true,
  createdAt: true,
  userId: { id: true, username: true, profilePicture: true, role: true },
  garmentId: { id: true, name: true, price: true, status: true },
  eventId: { id: true, title: true, startsAt: true },
  images: { id: true, url: true, isCover: true },
};
