// CalcFDM — Core FDM 3D Printing Price Calculation Engine (v4)

import type {
  SubPiece,
  ProjectParams,
  SaleType,
  Project,
  SubPieceCostBreakdown,
  ProjectPricingResult,
  PricingTier,
} from './types';

import { PRICING_TIER_CONFIG, SALE_TYPE_CONFIG } from './types';

// ─── Sale multiplier ───

export function getSaleMultiplier(saleType: SaleType, customMultiplier: number): number {
  switch (saleType) {
    case 'wholesale':
      return SALE_TYPE_CONFIG.wholesale.marginMultiplier; // 0.6
    case 'retail':
      return SALE_TYPE_CONFIG.retail.marginMultiplier; // 1.0
    case 'custom':
      return customMultiplier;
    case 'rush':
      return SALE_TYPE_CONFIG.rush.marginMultiplier; // 1.8
    default:
      return 1.0;
  }
}

// ─── Sub-piece price calculation ───

export function calculateSubPiecePrice(
  subPiece: SubPiece,
  params: ProjectParams,
  saleType: SaleType,
  customMultiplier: number,
  profitMargin: number,
): SubPieceCostBreakdown {
  // Total print time in hours
  const totalPrintTimeHours = subPiece.printTimeHours + subPiece.printTimeMinutes / 60;

  // Post-processing time in hours (removing supports, sanding, etc.)
  const postProcessingTimeHours = subPiece.postProcessingTimeMinutes / 60;

  // Dedicated labor/supervision time in hours (explicit time the operator spends)
  const laborTimeHours = (subPiece.laborTimeMinutes || 0) / 60;

  // Material cost: weight in grams → kg, apply waste percentage
  const materialCost =
    (subPiece.printWeight * (1 + subPiece.wastePercentage / 100) / 1000) *
    subPiece.filamentCostPerKg;

  // Printer depreciation per hour × print time
  const printerDepreciation =
    (params.printerCost / params.printerLifespanHours) * totalPrintTimeHours;

  // Electricity cost: watts → kW × hours × cost per kWh
  const electricityCost =
    (params.powerConsumptionWatts / 1000) * totalPrintTimeHours * params.electricityCostPerKWh;

  // Maintenance cost per hour × print time
  const maintenanceCost = params.maintenanceCostPerHour * totalPrintTimeHours;

  // Labor cost:
  // 1) 15% supervision factor for unattended print time (machine running = occasional check)
  // 2) Full rate for dedicated labor time (explicit supervision/manual work)
  // 3) Full rate for post-processing time (removing supports, sanding, etc.)
  const laborCost =
    params.laborCostPerHour * (
      totalPrintTimeHours * 0.15 +  // Passive supervision during print
      laborTimeHours +               // Active labor/supervision time
      postProcessingTimeHours         // Post-processing work
    );

  // Finishing cost (per piece, already includes quantity)
  const finishingCost = subPiece.finishingCostPerPiece * subPiece.quantity;

  // Failure cost: risk premium on core costs
  const failureCost =
    (materialCost + printerDepreciation + electricityCost + maintenanceCost + laborCost) *
    (params.failureRate / 100);

  // Per-unit subtotal (finishingCostPerPiece is per piece, not total)
  const subtotalPerUnit =
    materialCost +
    printerDepreciation +
    electricityCost +
    maintenanceCost +
    laborCost +
    subPiece.finishingCostPerPiece +  // Per piece, not total
    failureCost;

  // Overhead per unit
  const overheadPerUnit = subtotalPerUnit * (params.overheadPercentage / 100);

  // Base cost per unit (cost before profit)
  const baseCostPerUnit = subtotalPerUnit + overheadPerUnit;

  // Adjusted margin: base margin × sale type multiplier
  const adjustedMargin = profitMargin * getSaleMultiplier(saleType, customMultiplier);

  // Profit per unit
  const profitPerUnit = baseCostPerUnit * adjustedMargin;

  // Price before tax per unit
  const priceBeforeTaxPerUnit = baseCostPerUnit + profitPerUnit;

  // Tax per unit
  const taxPerUnit = priceBeforeTaxPerUnit * (params.taxRate / 100);

  // Total per unit
  const totalPerUnit = priceBeforeTaxPerUnit + taxPerUnit;

  // Total for the entire quantity
  const totalForQuantity = totalPerUnit * subPiece.quantity;

  return {
    subPieceId: subPiece.id,
    subPieceName: subPiece.name,
    quantity: subPiece.quantity,
    materialCost,
    printerDepreciation,
    electricityCost,
    maintenanceCost,
    laborCost,
    finishingCost,  // This is total for all quantity
    failureCost,
    subtotalPerUnit,
    overheadPerUnit,
    baseCostPerUnit,
    profitPerUnit,
    priceBeforeTaxPerUnit,
    taxPerUnit,
    totalPerUnit,
    totalForQuantity,
  };
}

// ─── Project price calculation ───

const ALL_TIERS: PricingTier[] = ['competitive', 'standard', 'premium', 'luxury'];

export function calculateProjectPrice(project: Project): ProjectPricingResult[] {
  const { params, saleType, customMultiplier } = project;

  // Design cost (project-level)
  const designCost = (params.designTimeMinutes / 60) * params.designHourlyRate;

  return ALL_TIERS.map((tier) => {
    const tierConfig = PRICING_TIER_CONFIG[tier];
    const profitMargin = tierConfig.baseMargin;

    // Calculate breakdown for every sub-piece at this tier
    const subPieceBreakdowns = project.subPieces.map((sp) =>
      calculateSubPiecePrice(sp, params, saleType, customMultiplier, profitMargin),
    );

    // Aggregate material cost (sum of materialCost × quantity)
    const totalMaterialCost = subPieceBreakdowns.reduce(
      (sum, b) => sum + b.materialCost * b.quantity,
      0,
    );

    // Base cost = sum of per-unit base costs × quantity + design cost
    const totalBaseCost =
      subPieceBreakdowns.reduce((sum, b) => sum + b.baseCostPerUnit * b.quantity, 0) + designCost;

    // Total profit = sum of per-unit profit × quantity
    const totalProfit = subPieceBreakdowns.reduce(
      (sum, b) => sum + b.profitPerUnit * b.quantity,
      0,
    );

    // Price before tax
    const totalPriceBeforeTax = totalBaseCost + totalProfit;

    // Tax on the pre-tax price
    const totalTax = totalPriceBeforeTax * (params.taxRate / 100);

    // Project-level fixed costs
    const totalPackaging = params.packagingCostPerProject;
    const totalShipping = params.shippingCostPerProject;

    // Grand total
    const totalProjectPrice = totalPriceBeforeTax + totalTax + totalPackaging + totalShipping;

    return {
      tier,
      tierLabel: tierConfig.label,
      tierDescription: tierConfig.description,
      profitMargin,
      subPieceBreakdowns,
      totalMaterialCost,
      totalBaseCost,
      totalProfit,
      totalPriceBeforeTax,
      totalTax,
      totalPackaging,
      totalShipping,
      totalProjectPrice,
    };
  });
}

// ─── Currency formatting ───

export function formatCurrency(amount: number): string {
  const fixed = Math.round(amount * 100) / 100;
  const parts = fixed.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  return `${integerPart},${decimalPart} €`;
}
