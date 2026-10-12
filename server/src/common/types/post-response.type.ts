import {
  GarmentStatus,
  PostTypeEnum,
  UserRoleEnum,
} from '../../common/types/enums';

export interface PostResponse {
  id: string;
  caption: string;
  postType: PostTypeEnum;
  createdAt: Date;
  images: { id: number; url: string; isCover: boolean }[];
  author: {
    id: string;
    username: string;
    profilePicture: string;
    role: UserRoleEnum;
  };
  garment: {
    id: string;
    name: string;
    price: number;
    status: GarmentStatus;
  } | null;
  event: { id: string; title: string; startsAt: Date } | null;
  likesCount: number;
  likedByMe: boolean;
}
