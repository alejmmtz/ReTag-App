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
  likesCount?: number;
  images: ProfileImage[];
  garment?: { id: string } | null;
};

export type ProfileGarment = {
  id: string;
  name: string;
  size: { id: number; type: string; label: string } | null;
  brand: { id: number; name: string } | null;
  category?: { id: number; name: string } | null;
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
  community: { followers: number; following: number; likesReceived: number };
  environment: { waterSaved: number | null };
};
// GET /stores/me
export type StoreProfile = {
  id: string;
  userId: string;
  storeName: string;
  socialmedia: string | null;
  schedule: string | null;
  location: string | null;
  description: string | null;
  images: {
    id: number;
    url: string;
    isCover: boolean;
    isProfile: boolean;
  }[];
};

export type ProfileEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  participantsCount?: number;
  store?: { id: string; storeName: string };
};
