export type User = {
  id: string;
  username?: string;
  profilePicture?: string | null;
  phone?: string;
};

export type GarmentImage = {
  id: number;
  url: string;
  isCover: boolean;
};

export type Garment = {
  id: string;
  name: string;
  images?: GarmentImage[];
  seller?: User;
  price?: string;
  condition?: string;
};

export type Transaction = {
  id: string;
  buyerId: string;
  transactionType: 'sale' | 'trade' | 'both';
  status:
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'canceled';

  buyer?: User;

  garment: Garment;
  tradeGarment?: Garment | null;
};

export type CurrentUser = {
  id: string;
  email: string;
  role: string;
};