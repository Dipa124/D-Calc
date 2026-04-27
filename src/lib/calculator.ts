// D-Calc — Core FDM 3D Printing Price Calculation Engine (v7)

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

// ─── Calculate amortization cost per hour ───
function calculateAmortizationPerHour(params: ProjectParams): number {
  const totalInvestment = params.printerCost + params.additionalInitialCost;
  const totalMonths = params.amortizationMonths || 30;
  const dailyHours = params.dailyUsageHours || 8;
  // Hours per month: daily hours × 30 days
  const hoursPerMonth = dailyHours * 30;
  // Monthly depreciation
  const monthlyDepreciation = totalInvestment / totalMonths;
  // Monthly maintenance
  const monthlyMaint = params.monthlyMaintenanceCost || 0;
  // Total monthly cost / hours per month
  const costPerHour = hoursPerMonth > 0 ? (monthlyDepreciation + monthlyMaint) / hoursPerMonth : 0;
  return costPerHour;
}

// ─── Apply price rounding ───
function applyRounding(price: number, rounding: 'none' | '0.99' | '0.50' | '1.00'): number {
  switch (rounding) {
    case '0.99': return Math.floor(price) + 0.99;
    case '0.50': return Math.round(price * 2) / 2;
    case '1.00': return Math.ceil(price);
    default: return price;
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

  // Material cost: weight in grams → kg, apply waste percentage
  const materialCost =
    (subPiece.printWeight * (1 + subPiece.wastePercentage / 100) / 1000) *
    subPiece.filamentCostPerKg;

  // Printer depreciation per hour × print time (using amortization model)
  const amortizationPerHour = calculateAmortizationPerHour(params);
  const printerDepreciation = amortizationPerHour * totalPrintTimeHours;

  // Electricity cost: watts → kW × hours × cost per kWh
  const electricityCost =
    (params.powerConsumptionWatts / 1000) * totalPrintTimeHours * params.electricityCostPerKWh;

  // Maintenance cost per hour × print time
  const maintenanceCost = params.maintenanceCostPerHour * totalPrintTimeHours;

  // Supervision cost: passive monitoring at supervision rate × 5% of print time
  const supervisionCost = params.supervisionCostPerHour * totalPrintTimeHours * 0.05;

  // Post-processing cost: rate × time
  const postProcessCost = subPiece.postProcessRatePerHour * postProcessingTimeHours;

  // Design cost per piece
  const designCost = (subPiece.designTimeMinutes / 60) * subPiece.designHourlyRate;

  // Finishing cost (per piece)
  const finishingCost = subPiece.finishingCostPerPiece;

  // Extra expenses for this piece (sum of all extra expenses)
  const extraExpensesCost = (subPiece.extraExpenses || []).reduce((sum: number, e: { price: number }) => sum + e.price, 0);

  // Failure cost: risk premium on core costs (with buffer factor)
  const coreCosts = materialCost + printerDepreciation + electricityCost + maintenanceCost + supervisionCost + postProcessCost;
  const failureCost = coreCosts * (params.failureRate / 100) * (params.bufferFactor || 1.0);

  // Per-unit subtotal
  const subtotalPerUnit =
    materialCost +
    printerDepreciation +
    electricityCost +
    maintenanceCost +
    supervisionCost +
    postProcessCost +
    finishingCost +
    designCost +
    extraExpensesCost +
    failureCost;

  // Monthly expenses cost per unit
  // Sum all monthly expenses, divide by hours per month, multiply by print time for this unit
  const totalMonthlyExpenses = (params.monthlyExpenses || []).reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
  const dailyHours = params.dailyUsageHours || 8;
  const hoursPerMonth = dailyHours * 30;
  const monthlyExpensesPerHour = hoursPerMonth > 0 ? totalMonthlyExpenses / hoursPerMonth : 0;
  const monthlyExpensesCost = monthlyExpensesPerHour * totalPrintTimeHours;

  // Base cost per unit (subtotal includes monthly expenses distributed per unit)
  const baseCostPerUnit = subtotalPerUnit + monthlyExpensesCost;

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
    postProcessCost,
    finishingCost,
    designCost,
    extraExpensesCost,
    failureCost,
    subtotalPerUnit,
    overheadPerUnit: monthlyExpensesCost,
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

  // Project-level extra expenses
  const projectExtraExpenses = (params.extraExpenses || []).reduce((sum: number, e: { price: number }) => sum + e.price, 0);

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
      subPieceBreakdowns.reduce((sum, b) => sum + b.baseCostPerUnit * b.quantity, 0);

    const totalProfit = subPieceBreakdowns.reduce(
      (sum, b) => sum + b.profitPerUnit * b.quantity,
      0,
    );

    const totalPriceBeforeTax = totalBaseCost + totalProfit;
    const totalTax = totalPriceBeforeTax * (params.taxRate / 100);
    const totalPackaging = params.packagingCostPerProject;
    const totalShipping = params.shippingCostPerProject;
    const totalExtraExpenses = projectExtraExpenses +
      subPieceBreakdowns.reduce((sum, b) => sum + b.extraExpensesCost * b.quantity, 0);

    // Commission calculation
    const priceBeforeCommission = totalPriceBeforeTax + totalTax + totalPackaging + totalShipping + totalExtraExpenses;
    const totalCommission = (priceBeforeCommission * params.commissionPercentage / 100) + params.commissionFixed;

    let totalProjectPrice = priceBeforeCommission + totalCommission;

    // Apply minimum order price
    if (params.minimumOrderPrice > 0 && totalProjectPrice < params.minimumOrderPrice) {
      totalProjectPrice = params.minimumOrderPrice;
    }

    // Apply price rounding
    const roundedPrice = applyRounding(totalProjectPrice, params.priceRounding);
    if (params.priceRounding !== 'none') {
      totalProjectPrice = roundedPrice;
    }

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
      totalExtraExpenses,
      totalCommission,
      totalProjectPrice,
      roundedPrice,
    };
  });
}

// ─── Currency formatting ───

export function formatCurrency(amount: number, currency: CurrencyCode = 'EUR'): string {
  return formatCurrencyValue(amount, currency);
}
