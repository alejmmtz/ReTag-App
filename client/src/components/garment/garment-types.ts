
export type CatalogItem = { id: number; name: string };

export type CatalogColor = CatalogItem & { hexcode: string };

export type CatalogSize = { id: number; type: string; label: string };

export type CatalogsResponse = {
  categories: CatalogItem[];
  brands: CatalogItem[];
  sizes: CatalogSize[];
  colors: CatalogColor[];
  tags: CatalogItem[];
  careDetails: CatalogItem[];
};

export type TransactionType = 'sale' | 'trade' | 'both';

export const MATERIALS = [
  'cotton',
  'twill',
  'voile',
  'linen',
  'silk',
  'cotton silk',
  'lyosell',
  'viscose',
  'hemp',
  'mesh',
  'poliester',
  'velvet',
  'elastane',
  'canvas',
  'panama',
  'crêpe',
  'georgette',
  'gabardine',
  'peach skin',
  'u-circular',
] as const;

export const CONDITIONS = [
  'like new',
  'very good',
  'good',
  'acceptable',
  'refurbished',
] as const;

export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'sale', label: 'Sale' },
  { value: 'trade', label: 'Trade' },
  { value: 'both', label: 'Both' },
];