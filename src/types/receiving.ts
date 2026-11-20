export type MaterialCategory = 'arame' | 'bobina' | 'barra' | 'tela_pop' | 'prego' | 'outros';

export type WireType = 'torcido' | 'liso';

export type WirePackaging = 'caixa_20kg' | 'rolo';

export type NailPackaging = 'caixa' | 'unidade';

export type TelaPopCode = 'Q45' | 'Q61' | 'Q92' | 'Q138';

export type OtherMeasureMode = 'unidade' | 'kg' | 'ambos';

export interface ReceivingHeader {
  id: string;
  protocol: string;
  receivedAt: string; // YYYY-MM-DDTHH:mm
  driverName: string;
  vehiclePlate: string;
  invoiceNumber: string;
  invoiceSeries?: string;
  receiverName: string;
  notes: string;
}

export interface CoilBatch {
  id: string;
  units: number;
  labelWeightsKg: number[];
  totalLabelKg: number | null;
  scaleKg: number | null;
}

export interface ReceivedItem {
  id: string;
  category: MaterialCategory;
  materialTitle: string; // e.g., "Arame Liso", "Bobina", "Barra", "Tela Pop Q92", "Pregos", "Outros"
  specification: string; // e.g., "BWG 18 (1.24 mm) · Caixa 20 kg", "Tela Pop Reforçada · Malha 15 × 15 cm"

  // Specific metadata for editing/filtering
  wireType?: WireType;
  gauge?: string;
  packaging?: WirePackaging | NailPackaging;
  unitsPerBox?: number;
  unitWeightKg?: number;
  telaModel?: TelaPopCode;
  customName?: string;
  otherMeasureMode?: OtherMeasureMode;

  // Quantities & Weights
  boxes: number | null;
  rolls: number | null;
  units: number | null;
  coilLabelWeightsKg?: number[]; // Pesos individuais das etiquetas de cada bobina (kg)
  coilBatches?: CoilBatch[]; // Pesagens em lote (ex: de 3 em 3 bobinas)
  weightLabelKg: number | null; // Peso na etiqueta (kg)
  weightScaleKg: number | null; // Peso na balança (kg)
  finalWeightKg: number | null; // Peso consolidado considerado (kg)
  weightRuleNote: string; // Explicação simples da origem do peso
  itemNotes: string;
}

export interface ReceivingRecord {
  header: ReceivingHeader;
  items: ReceivedItem[];
  updatedAt: string;
}
