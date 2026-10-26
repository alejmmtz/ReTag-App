import { BrandEntity } from './entities/brand.entity';
import { CareEntity } from './entities/care-details.entity';
import { CategoryEntity } from './entities/category.entity';
import { ColorEntity } from './entities/color.entity';
import { SizeEntity } from './entities/size.entity';
import { TagEntity } from './entities/tag.entity';

export const defaultCategories: Array<
  Pick<CategoryEntity, 'name' | 'waterWaste'>
> = [
  { name: 'T-Shirts', waterWaste: 2700 },
  { name: 'Shirts', waterWaste: 3000 },
  { name: 'Jeans / Denim', waterWaste: 7500 },
  { name: 'Pants', waterWaste: 5500 },
  { name: 'Hoodies & Sweatshirts', waterWaste: 4500 },
  { name: 'Jackets & Coats', waterWaste: 8000 },
  { name: 'Sweaters & Cardigans', waterWaste: 4000 },
  { name: 'Shorts', waterWaste: 3500 },
  { name: 'Skirts', waterWaste: 3000 },
  { name: 'Dresses', waterWaste: 6000 },
  { name: 'Underwear', waterWaste: 1200 },
  { name: 'Activewear', waterWaste: 3500 },
  { name: 'Sleepwear', waterWaste: 2500 },
  { name: 'Blouses', waterWaste: 2800 },
  { name: 'Blazers & Suits', waterWaste: 9000 },
];

export const defaultSizes: Array<Pick<SizeEntity, 'type' | 'label'>> = [
  { type: 'unisex', label: 'XS' },
  { type: 'unisex', label: 'S' },
  { type: 'unisex', label: 'M' },
  { type: 'unisex', label: 'L' },
  { type: 'unisex', label: 'XL' },
  { type: 'unisex', label: 'XXL' },
  { type: 'mens', label: '30' },
  { type: 'mens', label: '32' },
  { type: 'mens', label: '34' },
  { type: 'womens', label: '2' },
  { type: 'womens', label: '4' },
  { type: 'womens', label: '6' },
  { type: 'kids', label: '110-116' },
  { type: 'kids', label: '122-128' },
  { type: 'kids', label: '12M' },
];

export const defaultBrands: Array<
  Pick<BrandEntity, 'name' | 'logo' | 'description'>
> = [
  { name: 'True Religion', logo: null, description: null },
  { name: 'Ed Hardy', logo: null, description: null },
  { name: 'Nike', logo: null, description: null },
  { name: 'Adidas', logo: null, description: null },
  { name: "Levi's", logo: null, description: null },
  { name: 'Zara', logo: null, description: null },
  { name: 'H&M', logo: null, description: null },
  { name: 'Supreme', logo: null, description: null },
  { name: 'Stüssy', logo: null, description: null },
  { name: 'Carhartt WIP', logo: null, description: null },
  { name: 'Ralph Lauren', logo: null, description: null },
  { name: 'Calvin Klein', logo: null, description: null },
  { name: 'Tommy Hilfiger', logo: null, description: null },
  { name: 'The North Face', logo: null, description: null },
  { name: 'Von Dutch', logo: null, description: null },
  {
    name: 'Patagonia',
    logo: 'https://cdn.example.com/logos/patagonia.png',
    description:
      'Referente mundial en activismo ambiental, ropa outdoor, uso de materiales reciclados y programa de reparación de prendas (Worn Wear).',
  },
  {
    name: 'Stella McCartney',
    logo: 'https://cdn.example.com/logos/stellamccartney.png',
    description:
      'Pionera de la moda de lujo sostenible, libre de cuero y piel animal, e innovadora en biomateriales.',
  },
  {
    name: 'Pangaia',
    logo: 'https://cdn.example.com/logos/pangaia.png',
    description:
      'Compañía de ciencia de materiales enfocada en tintes botánicos, fibra de algas y algodón orgánico/reciclado.',
  },
  {
    name: 'tentree',
    logo: 'https://cdn.example.com/logos/tentree.png',
    description:
      'Marca de ropa casual certificada B-Corp que planta 10 árboles por cada prenda vendida y utiliza textiles sostenibles.',
  },
  {
    name: 'Veja',
    logo: 'https://cdn.example.com/logos/veja.png',
    description:
      'Marca de calzado urbano comprometida con el comercio justo, uso de caucho silvestre amazónico y algodón orgánico.',
  },
  {
    name: 'Allbirds',
    logo: 'https://cdn.example.com/logos/allbirds.png',
    description:
      'Calzado y ropa enfocados en reducir la huella de carbono mediante lana merino, fibra de eucalipto y espumas a base de caña de azúcar.',
  },
  {
    name: 'Eileen Fisher',
    logo: 'https://cdn.example.com/logos/eileenfisher.png',
    description:
      'Pionera del diseño minimalista y la moda circular (Renew), enfocada en fibras orgánicas y comercio ético.',
  },
  {
    name: 'Nudie Jeans',
    logo: 'https://cdn.example.com/logos/nudiejeans.png',
    description:
      'Marca de denim que ofrece reparación gratuita de por vida en sus jeans, utilizando algodón 100% orgánico.',
  },
  {
    name: 'People Tree',
    logo: 'https://cdn.example.com/logos/peopletree.png',
    description:
      'Pionera del comercio justo en la moda y pionera en obtener la certificación GOTS para algodón orgánico.',
  },
  {
    name: 'Reformation',
    logo: 'https://cdn.example.com/logos/reformation.png',
    description:
      'Marca fashion-forward enfocada en la moda circular, neutralidad de carbono y transparencia del impacto ambiental por prenda.',
  },
  {
    name: 'Everlane',
    logo: 'https://cdn.example.com/logos/everlane.png',
    description:
      'Famosa por su "transparencia radical" en costos, fábricas éticas y uso de telas recicladas u orgánicas.',
  },
  {
    name: 'Outerknown',
    logo: 'https://cdn.example.com/logos/outerknown.png',
    description:
      'Fundada por el surfista Kelly Slater, enfocada en materiales circulares como ECONYL (náilon reciclado de redes de pesca).',
  },
  {
    name: 'Finisterre',
    logo: 'https://cdn.example.com/logos/finisterre.png',
    description:
      'Marca outdoor B-Corp centrada en la fabricación de ropa técnica resistente, lana sostenible y prendas impermeables libres de fluorocarbonos.',
  },
  {
    name: 'Cotopaxi',
    logo: 'https://cdn.example.com/logos/cotopaxi.png',
    description:
      'Marca de equipamiento outdoor B-Corp que destina parte de sus ganancias a erradicar la pobreza y fabrica prendas usando retazos de tela sobrantes.',
  },
  {
    name: 'Organic Basics',
    logo: 'https://cdn.example.com/logos/organicbasics.png',
    description:
      'Marca enfocada en básicos de vestuario elaborados con tejidos biodegradables, reciclados y producción transparente en Europa.',
  },
];

export const defaultColors: Array<Pick<ColorEntity, 'name' | 'hexcode'>> = [
  { name: 'True Black', hexcode: '#000000' },
  { name: 'Pure White', hexcode: '#FFFFFF' },
  { name: 'Navy Blue', hexcode: '#001E42' },
  { name: 'Heather Gray', hexcode: '#8C8985' },
  { name: 'Charcoal Gray', hexcode: '#363636' },
  { name: 'Khaki', hexcode: '#DBCAB7' },
  { name: 'Cream', hexcode: '#F5F5DC' },
  { name: 'Olive Green', hexcode: '#556B2F' },
  { name: 'Chocolate Brown', hexcode: '#3F2933' },
  { name: 'Camel', hexcode: '#BDA06A' },
  { name: 'Terracotta / Rust', hexcode: '#B85042' },
  { name: 'Royal Blue', hexcode: '#408EC6' },
  { name: 'Sky Blue', hexcode: '#ADD8E6' },
  { name: 'Forest Green', hexcode: '#1E3F20' },
  { name: 'Teal', hexcode: '#487A7B' },
  { name: 'Mint Green', hexcode: '#C7E3A4' },
  { name: 'Wine', hexcode: '#51284F' },
  { name: 'Maroon', hexcode: '#7A1229' },
  { name: 'Emerald Green', hexcode: '#046307' },
  { name: 'Dark Purple', hexcode: '#4C3E4D' },
  { name: 'True Red', hexcode: '#E63946' },
  { name: 'Baby Pink', hexcode: '#F8CBEE' },
  { name: 'Mustard Yellow', hexcode: '#F2C03D' },
  { name: 'Lavender', hexcode: '#7474C1' },
  { name: 'Coral', hexcode: '#F4364C' },
];

export const defaultCareDetails: Array<
  Pick<CareEntity, 'name' | 'icon' | 'type'>
> = [
  { name: 'Machine wash cold', icon: 'icon-wash-cold', type: 'wash' },
  { name: 'Hand wash only', icon: 'icon-hand-wash', type: 'wash' },
  { name: 'Do not bleach', icon: 'icon-no-bleach', type: 'bleach' },
  {
    name: 'Non-chlorine bleach when needed',
    icon: 'icon-bleach-allowed',
    type: 'bleach',
  },
  { name: 'Tumble dry low heat', icon: 'icon-tumble-low', type: 'dry' },
  { name: 'Line dry in shade', icon: 'icon-line-dry', type: 'dry' },
  { name: 'Iron low heat (max 110°C)', icon: 'icon-iron-low', type: 'iron' },
  {
    name: 'Iron medium heat (max 150°C)',
    icon: 'icon-iron-medium',
    type: 'iron',
  },
  { name: 'Do not iron', icon: 'icon-no-iron', type: 'iron' },
  { name: 'Do not dry clean', icon: 'icon-no-dry-clean', type: 'dry' },
  { name: 'Professional dry clean', icon: 'icon-dry-clean', type: 'dry' },
  { name: 'Do not tumble dry', icon: 'icon-no-tumble-dry', type: 'dry' },
  { name: 'Wash inside out', icon: 'icon-wash-inside-out', type: 'wash' },
  { name: 'Wash with like colors', icon: 'icon-wash-similar', type: 'wash' },
  { name: 'Do not wring', icon: 'icon-no-wring', type: 'dry' },
];

export const defaultTags: Array<Pick<TagEntity, 'name'>> = [
  { name: 'Casual' },
  { name: 'Vintage' },
  { name: 'Streetwear' },
  { name: 'Athletic' },
  { name: 'Formal' },
  { name: 'Summer' },
  { name: 'Winter' },
  { name: 'Minimalist' },
  { name: 'Oversized' },
  { name: 'Y2K' },
  { name: 'Grunge' },
  { name: 'Essentials' },
  { name: 'Limited Edition' },
  { name: 'Sustainable / Eco-friendly' },
  { name: 'Party' },
];
