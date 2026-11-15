export type ProfileUser = {
  id: string;
  name: string | null;
  username: string;
  profilePicture: string | null;
  description: string | null;
  role: 'user' | 'store';
  createdAt: string;
};

export type ProfileImage = {
  id: number;
  url: string;
  isCover: boolean;
};

export type ProfilePost = {
  id: string;
  caption: string;
  postType: 'community' | 'offer' | 'show off' | 'event';
  createdAt: string;
  images: ProfileImage[];
};

export type ProfileGarment = {
  id: string;
  name: string;
  size: { id: number; type: string; label: string } | null;
  brand: { id: number; name: string } | null;
  price: number | string | null;
  transactionType: 'sale' | 'trade' | 'both' | null;
  status: string;
  images: ProfileImage[];
};

export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type MyStatistics = {
  posts: number;
  garments: { total: number; available: number };
  community: { followers: number; following: number };
  environment: { waterSaved: number | null };
};