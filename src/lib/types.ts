// D-Calc — Types (v7 — Professional Redesign)

import type { CurrencyCode } from './currency'
import type { Locale } from './i18n'

export type FilamentType =
  | 'PLA' | 'PLA+' | 'ABS' | 'PETG' | 'TPU' | 'Nylon'
  | 'CarbonFiber' | 'WoodFill' | 'MetalFill' | 'HIPS' | 'PVA' | 'ASA' | 'PC' | 'Custom';

export type SaleType = 'wholesale' | 'retail' | 'custom' | 'rush';
export type PricingTier = 'competitive' | 'standard' | 'premium' | 'luxury';
export type FinishingType = 'none' | 'lightSanding' | 'fullSanding' | 'primerPaint' | 'fullPaint' | 'vaporSmoothing' | 'epoxyCoating' | 'custom';
export type PostProcessType = 'none' | 'supportRemoval' | 'sanding' | 'painting' | 'assembly' | 'gluing' | 'polishing' | 'custom';

// ─── App Page ───
export type AppPage = 'home' | 'calculator' | 'auth' | 'dashboard';

// ─── Extra Expense (not per hour) ───
export interface ExtraExpense {
  id: string;
  description: string;
  price: number;
}

// ─── Printer Profile (user-created) ───
export interface PrinterProfile {
  id: string;
  name: string;                  // e.g. "My Bambu P1S"
  model: string;                 // e.g. "Bambu Lab P1S"
  price: number;                 // Purchase price in local currency
  expectedLifespanYears: number; // Years before replacement (converted to hours internally)
  powerConsumptionWatts: number; // Average power consumption during printing
  failureRate: number;           // Default failure rate percentage
  maintenanceCostPerHour: number; // Maintenance cost per hour
  isDefault?: boolean;           // If this is the user's default profile
}

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
  // Post-processing (replaces old labor)
  postProcessType: PostProcessType;
  postProcessingTimeMinutes: number;
  postProcessRatePerHour: number;     // Rate per hour for post-processing work
  // Design (per-piece)
  designTimeMinutes: number;
  designHourlyRate: number;
  // Extra expenses (not per hour)
  extraExpenses: ExtraExpense[];
}

// ─── Project shared params ───
export interface ProjectParams {
  printerProfileId: string;       // Printer profile ID or 'custom'
  printerCost: number;
  printerLifespanHours: number;
  maintenanceCostPerHour: number;
  powerConsumptionWatts: number;
  electricityCostPerKWh: number;
  supervisionCostPerHour: number; // Rate for passive print supervision (low — ~5% of print time)
  failureRate: number;
  overheadPercentage: number;
  // Logistics & Business
  taxRate: number;
  packagingCostPerProject: number;
  shippingCostPerProject: number;
  // Amortization
  dailyUsageHours: number;          // Average hours per day the printer is used
  amortizationMonths: number;       // Payback period in months
  monthlyMaintenanceCost: number;   // Monthly maintenance cost
  additionalInitialCost: number;    // Additional initial investment (tools, accessories)
  bufferFactor: number;             // Multiplier for unexpected downtime (1.0 = none, 1.3 = 30% buffer)
  // Business options
  commissionPercentage: number;     // Platform commission % (Etsy, Amazon, etc.)
  commissionFixed: number;          // Fixed platform fee per sale
  priceRounding: 'none' | '0.99' | '0.50' | '1.00';  // Psychological price rounding
  minimumOrderPrice: number;        // Floor price — no sale below this
  // Project-level extra expenses
  extraExpenses: ExtraExpense[];
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
  supervisionCost: number;
  postProcessCost: number;
  finishingCost: number;
  designCost: number;
  extraExpensesCost: number;
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
  totalExtraExpenses: number;
  totalCommission: number;
  totalProjectPrice: number;
  roundedPrice: number;
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
  competitive: { label: 'competitive', description: 'Aggressive pricing', baseMargin: 0.25, color: 'sage', accent: 'bg-sage/15 text-sage border-sage/30', darkAccent: '#6B9E72' },
  standard: { label: 'standard', description: 'Balanced margin', baseMargin: 0.60, color: 'copper', accent: 'bg-copper/15 text-copper border-copper/30', darkAccent: '#C77D3A' },
  premium: { label: 'premium', description: 'Quality positioning', baseMargin: 1.20, color: 'gold', accent: 'bg-gold/15 text-gold border-gold/30', darkAccent: '#D4A843' },
  luxury: { label: 'luxury', description: 'Exclusive service', baseMargin: 2.00, color: 'diamond', accent: 'bg-diamond/15 text-diamond border-diamond/30', darkAccent: '#4FC3F7' },
};

// ─── Finishing defaults ───
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

// ─── Post-processing type defaults ───
export const POST_PROCESS_DEFAULTS: Record<PostProcessType, { ratePerHour: number; description: string }> = {
  none: { ratePerHour: 0, description: 'No post-processing' },
  supportRemoval: { ratePerHour: 10, description: 'Remove supports and clean' },
  sanding: { ratePerHour: 15, description: 'Sanding and smoothing' },
  painting: { ratePerHour: 20, description: 'Painting and finishing' },
  assembly: { ratePerHour: 18, description: 'Assembly and joining' },
  gluing: { ratePerHour: 12, description: 'Gluing parts together' },
  polishing: { ratePerHour: 16, description: 'Polishing and buffing' },
  custom: { ratePerHour: 15, description: 'Custom post-processing' },
};

let _idCounter = 0;
export function generateId(): string { return `sp_${Date.now()}_${++_idCounter}`; }
export function generateProjectId(): string { return `proj_${Date.now()}_${++_idCounter}`; }
export function generateProfileId(): string { return `prf_${Date.now()}_${++_idCounter}`; }
export function generateExpenseId(): string { return `exp_${Date.now()}_${++_idCounter}`; }

export function getDefaultSubPiece(): SubPiece {
  return {
    id: generateId(), name: 'Piece 1', color: '#C77D3A',
    filamentType: 'PLA', customFilamentName: '', filamentCostPerKg: 20,
    printWeight: 50, wastePercentage: 8,
    printTimeHours: 3, printTimeMinutes: 30,
    quantity: 1, finishingType: 'none', finishingCostPerPiece: 0,
    customFinishingDescription: '',
    postProcessType: 'none', postProcessingTimeMinutes: 0, postProcessRatePerHour: 15,
    designTimeMinutes: 0, designHourlyRate: 25,
    extraExpenses: [],
  };
}

export function getDefaultProjectParams(): ProjectParams {
  return {
    printerProfileId: 'custom',
    printerCost: 300, printerLifespanHours: 5000, maintenanceCostPerHour: 0.10,
    powerConsumptionWatts: 200, electricityCostPerKWh: 0.15,
    supervisionCostPerHour: 5,
    failureRate: 5, overheadPercentage: 10,
    taxRate: 21, packagingCostPerProject: 0.50, shippingCostPerProject: 0,
    dailyUsageHours: 8, amortizationMonths: 30,
    monthlyMaintenanceCost: 0, additionalInitialCost: 0,
    bufferFactor: 1.0,
    commissionPercentage: 0, commissionFixed: 0,
    priceRounding: 'none', minimumOrderPrice: 0,
    extraExpenses: [],
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

// ─── Helper: Convert printer profile to project params ───
export function printerProfileToParams(profile: PrinterProfile): Partial<ProjectParams> {
  // Estimate hours from years: 8h/day * 250 working days = 2000h/year
  const estimatedHours = profile.expectedLifespanYears * 2000;
  return {
    printerProfileId: profile.id,
    printerCost: profile.price,
    printerLifespanHours: estimatedHours,
    maintenanceCostPerHour: profile.maintenanceCostPerHour,
    powerConsumptionWatts: profile.powerConsumptionWatts,
    failureRate: profile.failureRate,
  };
}

// ─── Default generic printer profile ───
export function getDefaultPrinterProfile(): PrinterProfile {
  return {
    id: 'custom',
    name: 'Generic FDM',
    model: 'Generic',
    price: 300,
    expectedLifespanYears: 2.5,
    powerConsumptionWatts: 200,
    failureRate: 5,
    maintenanceCostPerHour: 0.10,
    isDefault: true,
  };
}
