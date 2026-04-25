// CalcFDM — Types (v4)

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
  laborTimeMinutes: number; // Dedicated labor/supervision time (separate from post-processing)
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
  Custom: { costPerKg: 0 }, // No suggested price for custom
};

// ─── Sale type config ───
export const SALE_TYPE_CONFIG: Record<SaleType, { label: string; description: string; marginMultiplier: number; subtitle: string }> = {
  wholesale: { label: 'Mayorista', description: 'Venta al por mayor', marginMultiplier: 0.6, subtitle: '×0.6' },
  retail: { label: 'Minorista', description: 'Venta al por menor', marginMultiplier: 1.0, subtitle: '×1.0' },
  custom: { label: 'Personalizado', description: 'Multiplicador personalizado', marginMultiplier: 1.0, subtitle: 'Personalizar' },
  rush: { label: 'Urgente', description: 'Pedido urgente con prioridad', marginMultiplier: 1.8, subtitle: '×1.8' },
};

// ─── Pricing tier config (Lujo = diamond blue) ───
export const PRICING_TIER_CONFIG: Record<PricingTier, { label: string; description: string; baseMargin: number; color: string; accent: string; darkAccent: string }> = {
  competitive: { label: 'Competitivo', description: 'Precio agresivo para competir', baseMargin: 0.25, color: 'sage', accent: 'bg-sage/15 text-sage border-sage/30', darkAccent: '#6B9E72' },
  standard: { label: 'Estándar', description: 'Equilibrio entre beneficio y competitividad', baseMargin: 0.60, color: 'copper', accent: 'bg-copper/15 text-copper border-copper/30', darkAccent: '#C77D3A' },
  premium: { label: 'Premium', description: 'Posicionamiento de calidad', baseMargin: 1.20, color: 'gold', accent: 'bg-gold/15 text-gold border-gold/30', darkAccent: '#D4A843' },
  luxury: { label: 'Lujo', description: 'Servicio exclusivo y acabado premium', baseMargin: 2.00, color: 'diamond', accent: 'bg-diamond/15 text-diamond border-diamond/30', darkAccent: '#4FC3F7' },
};

// ─── Finishing defaults (custom has no suggested price) ───
export const FINISHING_DEFAULTS: Record<FinishingType, { costPerPiece: number; description: string; subtitle: string }> = {
  none: { costPerPiece: 0, description: 'Sin acabado', subtitle: 'Gratis' },
  lightSanding: { costPerPiece: 2, description: 'Lijado ligero', subtitle: '~2€/pieza' },
  fullSanding: { costPerPiece: 5, description: 'Lijado completo', subtitle: '~5€/pieza' },
  primerPaint: { costPerPiece: 8, description: 'Imprimación y pintura base', subtitle: '~8€/pieza' },
  fullPaint: { costPerPiece: 15, description: 'Pintura completa', subtitle: '~15€/pieza' },
  vaporSmoothing: { costPerPiece: 6, description: 'Alisado por vapor', subtitle: '~6€/pieza' },
  epoxyCoating: { costPerPiece: 10, description: 'Recubrimiento epoxi', subtitle: '~10€/pieza' },
  custom: { costPerPiece: 0, description: 'Acabado personalizado', subtitle: 'Personalizar' },
};

// ─── Parameter tooltips ───
export const PARAM_TOOLTIPS: Record<string, string> = {
  printerCost: 'Precio de compra de la impresora. Se usa para calcular la depreciación por hora de uso.',
  printerLifespanHours: 'Horas estimadas de vida útil de la impresora antes de necesitar reemplazo.',
  maintenanceCostPerHour: 'Coste de mantenimiento preventivo y reparaciones por hora de impresión.',
  powerConsumptionWatts: 'Consumo eléctrico medio de la impresora durante la impresión en vatios.',
  electricityCostPerKWh: 'Precio de la electricidad por kilovatio-hora según tu compañía eléctrica.',
  laborCostPerHour: 'Coste horario de mano de obra (supervisión de impresión + postprocesado).',
  failureRate: 'Porcentaje de probabilidad de fallo en la impresión. Se añade como prima de riesgo.',
  overheadPercentage: 'Porcentaje de gastos generales (alquiler, software, etc.) sobre el coste base.',
  taxRate: 'Tipo impositivo del IVA/IGIC aplicable a la venta.',
  packagingCostPerProject: 'Coste fijo de embalaje por proyecto (caja, relleno, cinta, etc.).',
  shippingCostPerProject: 'Coste de envío por proyecto. Se añade al precio final.',
  designTimeMinutes: 'Tiempo dedicado al diseño 3D del modelo (si aplica).',
  designHourlyRate: 'Tarifa horaria para el tiempo de diseño del modelo.',
  printWeight: 'Peso del filamento necesario para imprimir la pieza, en gramos.',
  filamentCostPerKg: 'Precio del filamento por kilogramo. Varía según tipo y marca.',
  printTime: 'Tiempo estimado de impresión. Afecta a depreciación, electricidad y mantenimiento.',
  wastePercentage: 'Porcentaje extra de material para compensar purgas, soportes y fallos.',
  quantity: 'Número de unidades idénticas de esta pieza.',
  postProcessingTimeMinutes: 'Tiempo dedicado al postprocesado: retirar soportes, lijado, pintura, etc.',
  laborTimeMinutes: 'Tiempo de supervisión/mano de obra directa (aparte del postprocesado). A diferencia del 15% automático del tiempo de impresión, este es tiempo de trabajo real.',
  finishingType: 'Tipo de acabado aplicado a la pieza tras la impresión.',
  finishingCostPerPiece: 'Coste del acabado por cada unidad de la pieza.',
  customFilamentName: 'Nombre del filamento personalizado.',
  color: 'Color del filamento usado para identificar la pieza visualmente.',
  filamentType: 'Tipo de filamento. Determina el precio recomendado por kg.',
  saleType: 'Tipo de venta. Afecta al multiplicador de margen: mayorista reduce, urgente aumenta.',
  customMultiplier: 'Multiplicador de margen personalizado. Puedes introducir cualquier valor positivo.',
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
    laborTimeMinutes: 0,
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
