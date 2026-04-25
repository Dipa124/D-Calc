// CalcFDM — Types (v3)

export type FilamentType =
  | 'PLA' | 'PLA+' | 'ABS' | 'PETG' | 'TPU' | 'Nylon'
  | 'CarbonFiber' | 'WoodFill' | 'MetalFill' | 'HIPS' | 'PVA' | 'ASA' | 'PC' | 'Custom';

export type SaleType = 'wholesale' | 'retail' | 'custom' | 'rush';
export type PricingTier = 'competitive' | 'standard' | 'premium' | 'luxury';
export type FinishingType = 'none' | 'lightSanding' | 'fullSanding' | 'primerPaint' | 'fullPaint' | 'vaporSmoothing' | 'epoxyCoating' | 'custom';

// ─── Sub-piece ───
export interface SubPiece {
  id: string;
  name: string;
  color: string;
  filamentType: FilamentType;
  customFilamentName: string;
  filamentCostPerKg: number;
  printWeight: number;
  wastePercentage: number;
  printTimeHours: number;
  printTimeMinutes: number;
  quantity: number;
  finishingType: FinishingType;
  finishingCostPerPiece: number;
  customFinishingDescription: string;
  postProcessingTimeMinutes: number;
}

// ─── Project shared params ───
export interface ProjectParams {
  printerCost: number;
  printerLifespanHours: number;
  maintenanceCostPerHour: number;
  powerConsumptionWatts: number;
  electricityCostPerKWh: number;
  laborCostPerHour: number;
  failureRate: number;
  overheadPercentage: number;
  taxRate: number;
  packagingCostPerProject: number;
  shippingCostPerProject: number;
  designTimeMinutes: number;
  designHourlyRate: number;
}

// ─── Project ───
export interface Project {
  id: string;
  name: string;
  saleType: SaleType;
  customMultiplier: number;
  selectedTier: PricingTier;
  subPieces: SubPiece[];
  params: ProjectParams;
}

// ─── Cost breakdown ───
export interface SubPieceCostBreakdown {
  subPieceId: string;
  subPieceName: string;
  quantity: number;
  materialCost: number;
  printerDepreciation: number;
  electricityCost: number;
  maintenanceCost: number;
  laborCost: number;
  finishingCost: number;
  failureCost: number;
  subtotalPerUnit: number;
  overheadPerUnit: number;
  baseCostPerUnit: number;
  profitPerUnit: number;
  priceBeforeTaxPerUnit: number;
  taxPerUnit: number;
  totalPerUnit: number;
  totalForQuantity: number;
}

export interface ProjectPricingResult {
  tier: PricingTier;
  tierLabel: string;
  tierDescription: string;
  profitMargin: number;
  subPieceBreakdowns: SubPieceCostBreakdown[];
  totalMaterialCost: number;
  totalBaseCost: number;
  totalProfit: number;
  totalPriceBeforeTax: number;
  totalTax: number;
  totalPackaging: number;
  totalShipping: number;
  totalProjectPrice: number;
}

// ─── Constants ───
export const FILAMENT_DEFAULTS: Record<FilamentType, { costPerKg: number; description: string }> = {
  PLA: { costPerKg: 20, description: 'Plástico biodegradable, fácil de imprimir' },
  'PLA+': { costPerKg: 25, description: 'PLA mejorado, mayor resistencia' },
  ABS: { costPerKg: 22, description: 'Alta resistencia térmica, requiere cámara' },
  PETG: { costPerKg: 25, description: 'Resistente químico, buena adherencia' },
  TPU: { costPerKg: 35, description: 'Filamento flexible, elastomérico' },
  Nylon: { costPerKg: 45, description: 'Alta resistencia mecánica y térmica' },
  CarbonFiber: { costPerKg: 60, description: 'Reforzado con fibra de carbono' },
  WoodFill: { costPerKg: 30, description: 'Con partículas de madera' },
  MetalFill: { costPerKg: 55, description: 'Con partículas metálicas' },
  HIPS: { costPerKg: 22, description: 'Soporte soluble en limoneno' },
  PVA: { costPerKg: 50, description: 'Soporte soluble en agua' },
  ASA: { costPerKg: 28, description: 'Resistente a UV, uso en exteriores' },
  PC: { costPerKg: 50, description: 'Policarbonato, máxima resistencia' },
  Custom: { costPerKg: 30, description: 'Filamento personalizado' },
};

export const SALE_TYPE_CONFIG: Record<SaleType, { label: string; description: string; marginMultiplier: number; subtitle: string }> = {
  wholesale: { label: 'Mayorista', description: 'Venta al por mayor', marginMultiplier: 0.6, subtitle: '×0.6' },
  retail: { label: 'Minorista', description: 'Venta al por menor', marginMultiplier: 1.0, subtitle: '×1.0' },
  custom: { label: 'Personalizado', description: 'Multiplicador personalizado', marginMultiplier: 1.0, subtitle: 'Elige tú' },
  rush: { label: 'Urgente', description: 'Pedido urgente con prioridad', marginMultiplier: 1.8, subtitle: '×1.8' },
};

export const PRICING_TIER_CONFIG: Record<PricingTier, { label: string; description: string; baseMargin: number; color: string; accent: string; darkAccent: string }> = {
  competitive: { label: 'Competitivo', description: 'Precio agresivo para competir', baseMargin: 0.25, color: 'sage', accent: 'bg-sage-500/15 text-sage-400 border-sage-500/30', darkAccent: '#6B9E72' },
  standard: { label: 'Estándar', description: 'Equilibrio entre beneficio y competitividad', baseMargin: 0.60, color: 'copper', accent: 'bg-copper-500/15 text-copper-400 border-copper-500/30', darkAccent: '#C77D3A' },
  premium: { label: 'Premium', description: 'Posicionamiento de calidad', baseMargin: 1.20, color: 'gold', accent: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', darkAccent: '#D4A843' },
  luxury: { label: 'Lujo', description: 'Servicio exclusivo y acabado premium', baseMargin: 2.00, color: 'luxury', accent: 'bg-amber-300/15 text-amber-300 border-amber-300/30', darkAccent: '#E8C97A' },
};

export const FINISHING_DEFAULTS: Record<FinishingType, { costPerPiece: number; description: string; subtitle: string }> = {
  none: { costPerPiece: 0, description: 'Sin acabado adicional', subtitle: '' },
  lightSanding: { costPerPiece: 2, description: 'Lijado ligero para eliminar marcas', subtitle: '~2€/pieza' },
  fullSanding: { costPerPiece: 5, description: 'Lijado completo, superficie lisa', subtitle: '~5€/pieza' },
  primerPaint: { costPerPiece: 8, description: 'Imprimación y pintura base', subtitle: '~8€/pieza' },
  fullPaint: { costPerPiece: 15, description: 'Pintura completa con detalles', subtitle: '~15€/pieza' },
  vaporSmoothing: { costPerPiece: 6, description: 'Alisado por vapor (ABS/acetona)', subtitle: '~6€/pieza' },
  epoxyCoating: { costPerPiece: 10, description: 'Recubrimiento de resina epoxi', subtitle: '~10€/pieza' },
  custom: { costPerPiece: 0, description: 'Acabado personalizado', subtitle: 'Elige tú' },
};

let _idCounter = 0;
export function generateId(): string { return `sp_${Date.now()}_${++_idCounter}`; }
export function generateProjectId(): string { return `proj_${Date.now()}_${++_idCounter}`; }

export function getDefaultSubPiece(): SubPiece {
  return {
    id: generateId(), name: 'Pieza 1', color: '#C77D3A',
    filamentType: 'PLA', customFilamentName: '', filamentCostPerKg: 20,
    printWeight: 50, wastePercentage: 5,
    printTimeHours: 3, printTimeMinutes: 30,
    quantity: 1, finishingType: 'none', finishingCostPerPiece: 0,
    customFinishingDescription: '', postProcessingTimeMinutes: 0,
  };
}

export function getDefaultProjectParams(): ProjectParams {
  return {
    printerCost: 300, printerLifespanHours: 5000, maintenanceCostPerHour: 0.10,
    powerConsumptionWatts: 200, electricityCostPerKWh: 0.15, laborCostPerHour: 15,
    failureRate: 5, overheadPercentage: 10, taxRate: 21,
    packagingCostPerProject: 0.50, shippingCostPerProject: 0,
    designTimeMinutes: 0, designHourlyRate: 25,
  };
}

export function getDefaultProject(): Project {
  return {
    id: generateProjectId(), name: 'Mi Proyecto', saleType: 'retail',
    customMultiplier: 1.4, selectedTier: 'standard',
    subPieces: [getDefaultSubPiece()], params: getDefaultProjectParams(),
  };
}
