// D-Calc — Core FDM 3D Printing Price Calculation Engine (v6)

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
import { formatCurrencyValue } from './currency';
import type { CurrencyCode } from './currency';

// ─── Sale multiplier ───

export function getSaleMultiplier(saleType: SaleType, customMultiplier: number): number {
  switch (saleType) {
    case 'wholesale':
      return SALE_TYPE_CONFIG.wholesale.marginMultiplier;
    case 'retail':
      return SALE_TYPE_CONFIG.retail.marginMultiplier;
    case 'custom':
      return customMultiplier;
    case 'rush':
      return SALE_TYPE_CONFIG.rush.marginMultiplier;
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
  const totalPrintTimeHours = subPiece.printTimeHours + subPiece.printTimeMinutes / 60;
  const postProcessingTimeHours = subPiece.postProcessingTimeMinutes / 60;
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

  // Supervision cost: passive monitoring at supervision rate × 5% of print time
  const supervisionCost = params.supervisionCostPerHour * totalPrintTimeHours * 0.05;

  // Labor cost: post-processing + direct manual work at labor rate
  const laborCost = params.laborCostPerHour * (postProcessingTimeHours + laborTimeHours);

  // Finishing cost (per piece, already includes quantity)
  const finishingCost = subPiece.finishingCostPerPiece * subPiece.quantity;

  // Failure cost: risk premium on core costs
  const failureCost =
    (materialCost + printerDepreciation + electricityCost + maintenanceCost + supervisionCost + laborCost) *
    (params.failureRate / 100);

  // Per-unit subtotal
  const subtotalPerUnit =
    materialCost +
    printerDepreciation +
    electricityCost +
    maintenanceCost +
    supervisionCost +
    laborCost +
    subPiece.finishingCostPerPiece +
    failureCost;

  // Overhead per unit
  const overheadPerUnit = subtotalPerUnit * (params.overheadPercentage / 100);

  // Base cost per unit
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
    supervisionCost,
    laborCost,
    finishingCost,
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
  const designCost = (params.designTimeMinutes / 60) * params.designHourlyRate;

  return ALL_TIERS.map((tier) => {
    const tierConfig = PRICING_TIER_CONFIG[tier];
    const profitMargin = tierConfig.baseMargin;

    const subPieceBreakdowns = project.subPieces.map((sp) =>
      calculateSubPiecePrice(sp, params, saleType, customMultiplier, profitMargin),
    );

    const totalMaterialCost = subPieceBreakdowns.reduce(
      (sum, b) => sum + b.materialCost * b.quantity,
      0,
    );

    const totalBaseCost =
      subPieceBreakdowns.reduce((sum, b) => sum + b.baseCostPerUnit * b.quantity, 0) + designCost;

    const totalProfit = subPieceBreakdowns.reduce(
      (sum, b) => sum + b.profitPerUnit * b.quantity,
      0,
    );

    const totalPriceBeforeTax = totalBaseCost + totalProfit;
    const totalTax = totalPriceBeforeTax * (params.taxRate / 100);
    const totalPackaging = params.packagingCostPerProject;
    const totalShipping = params.shippingCostPerProject;
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

export function formatCurrency(amount: number, currency: CurrencyCode = 'EUR'): string {
  return formatCurrencyValue(amount, currency);
}
