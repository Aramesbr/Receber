import { MaterialCategory, TelaPopCode, WirePackaging } from '../types/receiving';

export interface CategoryMeta {
  id: MaterialCategory;
  label: string;
  shortDesc: string;
}

export const MATERIAL_CATEGORIES: CategoryMeta[] = [
  {
    id: 'arame',
    label: 'Arames',
    shortDesc: 'Torcido e Liso',
  },
  {
    id: 'bobina',
    label: 'Bobinas',
    shortDesc: '3.8 a 6.0 mm',
  },
  {
    id: 'barra',
    label: 'Barras',
    shortDesc: '4.2 a 10 mm',
  },
  {
    id: 'tela_pop',
    label: 'Telas Pop',
    shortDesc: 'Q45 a Q138',
  },
  {
    id: 'prego',
    label: 'Pregos',
    shortDesc: 'Caixas (1 kg/un)',
  },
  {
    id: 'outros',
    label: 'Outros',
    shortDesc: 'Unidade ou Kg',
  },
];

export interface WireGaugeSpec {
  id: string;
  label: string;
  mm: string;
  allowedPackagings: WirePackaging[];
  boxWeightKg: number;
  boxUnits: number;
  rollMinKg: number;
  rollMaxKg: number;
}

export const TWISTED_WIRE_GAUGES: WireGaugeSpec[] = [
  {
    id: 'BWG 18 (1.24 mm)',
    label: 'BWG 18 (1.24 mm)',
    mm: '1.24 mm',
    allowedPackagings: ['caixa_20kg'],
    boxWeightKg: 20,
    boxUnits: 20,
    rollMinKg: 0,
    rollMaxKg: 0,
  },
];

export const SMOOTH_WIRE_GAUGES: WireGaugeSpec[] = [
  {
    id: 'BWG 18 (1.24 mm)',
    label: 'BWG 18 (1.24 mm)',
    mm: '1.24 mm',
    allowedPackagings: ['caixa_20kg', 'rolo'],
    boxWeightKg: 20,
    boxUnits: 20,
    rollMinKg: 25,
    rollMaxKg: 75,
  },
  {
    id: 'BWG 16 (1.65 mm)',
    label: 'BWG 16 (1.65 mm)',
    mm: '1.65 mm',
    allowedPackagings: ['rolo'],
    boxWeightKg: 0,
    boxUnits: 0,
    rollMinKg: 25,
    rollMaxKg: 75,
  },
  {
    id: 'BWG 14 (2.11 mm)',
    label: 'BWG 14 (2.11 mm)',
    mm: '2.11 mm',
    allowedPackagings: ['rolo'],
    boxWeightKg: 0,
    boxUnits: 0,
    rollMinKg: 25,
    rollMaxKg: 75,
  },
  {
    id: 'BWG 12 (2.77 mm)',
    label: 'BWG 12 (2.77 mm)',
    mm: '2.77 mm',
    allowedPackagings: ['caixa_20kg', 'rolo'],
    boxWeightKg: 20,
    boxUnits: 20,
    rollMinKg: 25,
    rollMaxKg: 75,
  },
  {
    id: 'BWG 10 (3,40 mm)',
    label: 'BWG 10 (3,40 mm)',
    mm: '3,40 mm',
    allowedPackagings: ['rolo'],
    boxWeightKg: 0,
    boxUnits: 0,
    rollMinKg: 25,
    rollMaxKg: 75,
  },
];

export const COIL_GAUGES: string[] = ['3.8 mm', '4.2 mm', '5.0 mm', '6.0 mm'];

export const BAR_GAUGES: string[] = ['4.2 mm', '5.0 mm', '6.3 mm', '8.0 mm', '10 mm'];

export const NAIL_GAUGES: string[] = [
  '12 × 12',
  '15 × 15',
  '17 × 21',
  '18 × 27',
  '18 × 30',
  '19 × 36',
  '22 × 48',
];

export interface TelaPopSpec {
  code: TelaPopCode;
  diameter: string;
  tier: string;
  title: string;
  mesh: string;
  fullDescription: string;
}

export const TELA_POP_SPECS: TelaPopSpec[] = [
  {
    code: 'Q45',
    diameter: '3.4 mm',
    tier: 'Leve',
    title: 'Q45 (3.4 mm) Leve',
    mesh: 'Malha 20 × 20 cm',
    fullDescription: 'Tela Pop Leve · Malha 20 × 20 cm',
  },
  {
    code: 'Q61',
    diameter: '3.4 mm',
    tier: 'Média',
    title: 'Q61 (3.4 mm) Média',
    mesh: 'Malha 15 × 15 cm',
    fullDescription: 'Tela Pop Média · Malha 15 × 15 cm',
  },
  {
    code: 'Q92',
    diameter: '4.2 mm',
    tier: 'Reforçada',
    title: 'Q92 (4.2 mm) Reforçada',
    mesh: 'Malha 15 × 15 cm',
    fullDescription: 'Tela Pop Reforçada · Malha 15 × 15 cm',
  },
  {
    code: 'Q138',
    diameter: '4.2 mm',
    tier: 'Pesada',
    title: 'Q138 (4.2 mm) Pesada',
    mesh: 'Malha 10 × 10 cm',
    fullDescription: 'Tela Pop Pesada · Malha 10 × 10 cm',
  },
];
