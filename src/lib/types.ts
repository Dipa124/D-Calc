// D-Calc — Types (v5)

import type { CurrencyCode } from './currency'
import type { Locale } from './i18n'

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
  laborTimeMinutes: number; // Dedicated labor/assembly time (separate from post-processing and supervision)
}

// ─── Project shared params ───
export interface ProjectParams {
  printerModel: string;       // Printer DB id or 'custom'
  printerCost: number;
  printerLifespanHours: number;
  maintenanceCostPerHour: number;
  powerConsumptionWatts: number;
  electricityCostPerKWh: number;
  laborCostPerHour: number;           // Rate for post-processing + direct manual work
  supervisionCostPerHour: number;     // Rate for passive print supervision (15% of print time)
  additionalLaborCostPerHour: number; // Rate for additional labor (applied to laborTimeMinutes)
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
  currency: CurrencyCode;
  locale: Locale;
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
  supervisionCost: number;      // Passive supervision cost
  laborCost: number;            // Post-processing + direct labor
  additionalLaborCost: number;  // Additional labor (assembly, etc.)
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

// ─── Filament database (no descriptions, no custom price suggestion) ───
export const FILAMENT_DEFAULTS: Record<FilamentType, { costPerKg: number }> = {
  PLA: { costPerKg: 20 },
  'PLA+': { costPerKg: 25 },
  ABS: { costPerKg: 22 },
  PETG: { costPerKg: 25 },
  TPU: { costPerKg: 35 },
  Nylon: { costPerKg: 45 },
  CarbonFiber: { costPerKg: 60 },
  WoodFill: { costPerKg: 30 },
  MetalFill: { costPerKg: 55 },
  HIPS: { costPerKg: 22 },
  PVA: { costPerKg: 50 },
  ASA: { costPerKg: 28 },
  PC: { costPerKg: 50 },
  Custom: { costPerKg: 0 },
};

// ─── Sale type config ───
export const SALE_TYPE_CONFIG: Record<SaleType, { marginMultiplier: number; subtitle: string }> = {
  wholesale: { marginMultiplier: 0.6, subtitle: '×0.6' },
  retail: { marginMultiplier: 1.0, subtitle: '×1.0' },
  custom: { marginMultiplier: 1.0, subtitle: 'Custom' },
  rush: { marginMultiplier: 1.8, subtitle: '×1.8' },
};

// ─── Pricing tier config (Lujo = diamond blue) ───
export const PRICING_TIER_CONFIG: Record<PricingTier, { label: string; description: string; baseMargin: number; color: string; accent: string; darkAccent: string }> = {
  competitive: { label: 'Competitive', description: 'Aggressive pricing', baseMargin: 0.25, color: 'sage', accent: 'bg-sage/15 text-sage border-sage/30', darkAccent: '#6B9E72' },
  standard: { label: 'Standard', description: 'Balanced margin', baseMargin: 0.60, color: 'copper', accent: 'bg-copper/15 text-copper border-copper/30', darkAccent: '#C77D3A' },
  premium: { label: 'Premium', description: 'Quality positioning', baseMargin: 1.20, color: 'gold', accent: 'bg-gold/15 text-gold border-gold/30', darkAccent: '#D4A843' },
  luxury: { label: 'Luxury', description: 'Exclusive service', baseMargin: 2.00, color: 'diamond', accent: 'bg-diamond/15 text-diamond border-diamond/30', darkAccent: '#4FC3F7' },
};

// ─── Finishing defaults (custom has no suggested price) ───
export const FINISHING_DEFAULTS: Record<FinishingType, { costPerPiece: number; subtitle: string }> = {
  none: { costPerPiece: 0, subtitle: 'Free' },
  lightSanding: { costPerPiece: 2, subtitle: '~2€/pc' },
  fullSanding: { costPerPiece: 5, subtitle: '~5€/pc' },
  primerPaint: { costPerPiece: 8, subtitle: '~8€/pc' },
  fullPaint: { costPerPiece: 15, subtitle: '~15€/pc' },
  vaporSmoothing: { costPerPiece: 6, subtitle: '~6€/pc' },
  epoxyCoating: { costPerPiece: 10, subtitle: '~10€/pc' },
  custom: { costPerPiece: 0, subtitle: 'Custom' },
};

let _idCounter = 0;
export function generateId(): string { return `sp_${Date.now()}_${++_idCounter}`; }
export function generateProjectId(): string { return `proj_${Date.now()}_${++_idCounter}`; }

export function getDefaultSubPiece(): SubPiece {
  return {
    id: generateId(), name: 'Piece 1', color: '#C77D3A',
    filamentType: 'PLA', customFilamentName: '', filamentCostPerKg: 20,
    printWeight: 50, wastePercentage: 5,
    printTimeHours: 3, printTimeMinutes: 30,
    quantity: 1, finishingType: 'none', finishingCostPerPiece: 0,
    customFinishingDescription: '', postProcessingTimeMinutes: 0,
    laborTimeMinutes: 0,
  };
}

export function getDefaultProjectParams(): ProjectParams {
  return {
    printerModel: 'custom',
    printerCost: 300, printerLifespanHours: 5000, maintenanceCostPerHour: 0.10,
    powerConsumptionWatts: 200, electricityCostPerKWh: 0.15,
    laborCostPerHour: 15,
    supervisionCostPerHour: 12,
    additionalLaborCostPerHour: 18,
    failureRate: 5, overheadPercentage: 10, taxRate: 21,
    packagingCostPerProject: 0.50, shippingCostPerProject: 0,
    designTimeMinutes: 0, designHourlyRate: 25,
  };
}

export function getDefaultProject(): Project {
  return {
    id: generateProjectId(), name: 'My Project', saleType: 'retail',
    customMultiplier: 1.4, selectedTier: 'standard',
    subPieces: [getDefaultSubPiece()], params: getDefaultProjectParams(),
    currency: 'EUR', locale: 'es',
  };
}
