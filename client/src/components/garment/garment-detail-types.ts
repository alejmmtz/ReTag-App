

export type GarmentDetail = {
  id: string;
  name: string;
  description: string;
  material: string;
  datePurchased: string; 
  status: 'available' | 'traded' | 'purchased';
  waterSaved: string | number | null;
  condition: string | null;
  price: number | string | null;
  transactionType: 'sale' | 'trade' | 'both' | null;
  createdAt: string;
  category: { id: number; name: string; waterWaste: string } | null;
  size: { id: number; type: string; label: string } | null;
  brand: { id: number; name: string } | null;
  seller: {
    id: string;
    name: string | null;
    username: string;
    profilePicture: string | null;
    role: 'user' | 'store';
  };
  images: { id: number; url: string; isCover: boolean }[];
  colors: { id: number; name: string; hexcode: string }[];
  tags: { id: number; name: string }[];
  care: { id: number; name: string } | null;
};