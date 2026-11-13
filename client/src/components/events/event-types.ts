export type StoreImage = {
  id: number;
  url: string;
  isCover: boolean;
  isProfile: boolean;
};

export type EventStore = {
  id: string;
  userId: string;
  storeName: string;
  images?: StoreImage[];
};

export type Event = {
  id: string;
  title: string;
  description: string;
  status: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  capacity?: number;
  participantsCount: number;
  store?: EventStore;
};

export type CurrentUser = {
  id: string;
};