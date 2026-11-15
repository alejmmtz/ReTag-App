export type PostType = 'community' | 'offer' | 'show off' | 'event';

export type FeedFilter = 'for_you' | 'following' | 'underground';

export type PostImage = {
  id: number;
  url: string;
  isCover: boolean;
};

export type PostAuthor = {
  id: string;
  username: string;
  profilePicture: string | null;
  role: 'user' | 'store';
};

export type PostItem = {
  id: string;
  caption: string;
  postType: PostType;
  createdAt: string;
  images: PostImage[];
  author: PostAuthor;
  garment: {
    id: string;
    name: string;
    price: number;
    status: string;
  } | null;
  event: {
    id: string;
    title: string;
    startsAt: string;
  } | null;
  likesCount: number;
  likedByMe: boolean;
};

export type PostsPage = {
  data: PostItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type MeResponse = {
  id: string;
  email: string;
  role: 'user' | 'store';
};

export type PublicUser = {
  id: string;
  name: string | null;
  username: string;
  profilePicture: string | null;
  role: 'user' | 'store';
  description: string | null;
};
