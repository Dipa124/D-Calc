import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { formatCurrencyValue } from '@/lib/currency'
import type { CurrencyCode } from '@/lib/currency'
import type { Project, ProjectPricingResult } from '@/lib/types'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const report = await db.sharedReport.findUnique({
      where: { id },
    })

    if (!report) {
      return new NextResponse('Report not found', { status: 404 })
    }

    // Check expiration
    if (report.expiresAt && new Date() > report.expiresAt) {
      return new NextResponse('This report has expired', { status: 410 })
    }

    const project: Project = JSON.parse(report.projectData)
    const pricing: ProjectPricingResult = JSON.parse(report.pricingData)

    // Validate required data
    if (!project?.params || !project?.name) {
      return new NextResponse('Invalid report data', { status: 500 })
    }

    const currency = (report.currency || project.currency || 'EUR') as CurrencyCode
    const isInvoice = report.reportType === 'invoice'
    const date = new Date(report.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const fc = (amount: number) => formatCurrencyValue(amount, currency)

    const html = generateReportHtml(project, pricing, currency, isInvoice, date, fc)

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching shared report:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

function generateReportHtml(
  project: Project,
  pricing: ProjectPricingResult,
  currency: CurrencyCode,
  isInvoice: boolean,
  date: string,
  fc: (n: number) => string
): string {
  const title = isInvoice ? `Presupuesto — ${project.name}` : `Reporte Productor — ${project.name}`

  if (isInvoice) {
    return generateInvoiceHtml(project, pricing, currency, title, date, fc)
  }
  return generateProducerHtml(project, pricing, currency, title, date, fc)
}

function generateProducerHtml(
  project: Project,
  pricing: ProjectPricingResult,
  currency: CurrencyCode,
  title: string,
  date: string,
  fc: (n: number) => string
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
      background: #fff;
      color: #1a1a2e;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 3px solid #C77D3A; padding-bottom: 20px; margin-bottom: 30px;
    }
    .logo { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #C77D3A; }
    .logo span { color: #6B9E72; }
    .header-right { text-align: right; font-size: 13px; color: #6B6572; }
    h1 { font-family: 'Space Grotesk', sans-serif; font-size: 20px; margin-bottom: 5px; color: #1a1a2e; }
    .project-name { font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; color: #C77D3A; margin-bottom: 5px; }
    .tier-badge {
      display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
      background: ${pricing.profitMargin >= 1 ? '#D4A84320' : '#C77D3A20'}; color: ${pricing.profitMargin >= 1 ? '#D4A843' : '#C77D3A'};
    }
    .section { margin-bottom: 25px; }
    .section-title {
      font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600;
      color: #C77D3A; text-transform: uppercase; letter-spacing: 1px;
      border-bottom: 1px solid #E8E2DA; padding-bottom: 8px; margin-bottom: 12px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 12px; background: #F5F0EB; color: #6B6572; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 8px 12px; border-bottom: 1px solid #E8E2DA; }
    tr:hover td { background: #F5F0EB; }
    .amount { font-family: 'Space Grotesk', monospace; font-weight: 600; text-align: right; }
    .total-row { background: #F5F0EB; font-weight: 700; }
    .total-row td { border-bottom: 2px solid #C77D3A; }
    .grand-total { background: #C77D3A15; }
    .grand-total td { border-bottom: 3px solid #C77D3A; font-size: 16px; font-weight: 700; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #E8E2DA; font-size: 11px; color: #6B6572; text-align: center; }
    .param-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .param-item { padding: 8px 12px; background: #F5F0EB; border-radius: 8px; }
    .param-label { font-size: 10px; color: #6B6572; text-transform: uppercase; letter-spacing: 0.5px; }
    .param-value { font-family: 'Space Grotesk', monospace; font-weight: 600; font-size: 14px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">D-<span>Calc</span></div>
      <div style="font-size: 12px; color: #6B6572; margin-top: 4px;">Reporte detallado del productor</div>
    </div>
    <div class="header-right">
      <div style="font-weight: 600;">${date}</div>
      <div>Reporte generado automáticamente</div>
    </div>
  </div>

  <div style="margin-bottom: 25px;">
    <h1>Proyecto</h1>
    <div class="project-name">${project.name}</div>
    <div class="tier-badge">${pricing.tierLabel} — Margen ${(pricing.profitMargin * 100).toFixed(0)}%</div>
  </div>

  <div class="section">
    <div class="section-title">Parámetros de impresión</div>
    <div class="param-grid">
      <div class="param-item"><div class="param-label">Impresora</div><div class="param-value">${fc(project.params.printerCost)}</div></div>
      <div class="param-item"><div class="param-label">Vida útil</div><div class="param-value">${project.params.printerLifespanHours}h</div></div>
      <div class="param-item"><div class="param-label">Consumo</div><div class="param-value">${project.params.powerConsumptionWatts}W</div></div>
      <div class="param-item"><div class="param-label">Electricidad</div><div class="param-value">${fc(project.params.electricityCostPerKWh)}/kWh</div></div>
      <div class="param-item"><div class="param-label">IVA</div><div class="param-value">${project.params.taxRate}%</div></div>
      <div class="param-item"><div class="param-label">Tasa fallo</div><div class="param-value">${project.params.failureRate}%</div></div>
      <div class="param-item"><div class="param-label">Overhead</div><div class="param-value">${project.params.overheadPercentage}%</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Desglose por subpieza</div>
    ${pricing.subPieceBreakdowns.map(b => `
    <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 15px; margin: 15px 0 8px;">${b.subPieceName} ×${b.quantity}</h3>
    <table>
      <thead><tr><th>Concepto</th><th style="text-align:right;">Importe</th></tr></thead>
      <tbody>
        <tr><td>Material (con desperdicio)</td><td class="amount">${fc(b.materialCost)}</td></tr>
        <tr><td>Depreciación impresora</td><td class="amount">${fc(b.printerDepreciation)}</td></tr>
        <tr><td>Electricidad</td><td class="amount">${fc(b.electricityCost)}</td></tr>
        <tr><td>Mantenimiento</td><td class="amount">${fc(b.maintenanceCost)}</td></tr>
        <tr><td>Mano de obra</td><td class="amount">${fc(b.laborCost)}</td></tr>
        <tr><td>Acabado</td><td class="amount">${fc(b.finishingCost)}</td></tr>
        <tr><td>Riesgo de fallo</td><td class="amount">${fc(b.failureCost)}</td></tr>
        <tr class="total-row"><td>Subtotal/unidad</td><td class="amount">${fc(b.subtotalPerUnit)}</td></tr>
        <tr><td>Overhead/unidad</td><td class="amount">${fc(b.overheadPerUnit)}</td></tr>
        <tr class="total-row"><td>Coste base/unidad</td><td class="amount">${fc(b.baseCostPerUnit)}</td></tr>
        <tr><td>Beneficio/unidad</td><td class="amount">${fc(b.profitPerUnit)}</td></tr>
        <tr><td>IVA/unidad</td><td class="amount">${fc(b.taxPerUnit)}</td></tr>
        <tr class="grand-total"><td>Total/unidad</td><td class="amount">${fc(b.totalPerUnit)}</td></tr>
        <tr class="grand-total"><td>Total ×${b.quantity}</td><td class="amount">${fc(b.totalForQuantity)}</td></tr>
      </tbody>
    </table>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">Resumen del proyecto</div>
    <table>
      <tbody>
        <tr><td>Coste total material</td><td class="amount">${fc(pricing.totalMaterialCost)}</td></tr>
        <tr><td>Coste base total</td><td class="amount">${fc(pricing.totalBaseCost)}</td></tr>
        <tr><td>Beneficio total</td><td class="amount">${fc(pricing.totalProfit)}</td></tr>
        <tr><td>Precio sin IVA</td><td class="amount">${fc(pricing.totalPriceBeforeTax)}</td></tr>
        <tr><td>IVA (${project.params.taxRate}%)</td><td class="amount">${fc(pricing.totalTax)}</td></tr>
        ${pricing.totalPackaging > 0 ? `<tr><td>Embalaje</td><td class="amount">${fc(pricing.totalPackaging)}</td></tr>` : ''}
        ${pricing.totalShipping > 0 ? `<tr><td>Envío</td><td class="amount">${fc(pricing.totalShipping)}</td></tr>` : ''}
        <tr class="grand-total"><td>PRECIO TOTAL DEL PROYECTO</td><td class="amount" style="font-size:20px;">${fc(pricing.totalProjectPrice)}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    Generated by D-Calc — Professional FDM 3D Printing Calculator · ${date}
  </div>
</body>
</html>`
}

function generateInvoiceHtml(
  project: Project,
  pricing: ProjectPricingResult,
  currency: CurrencyCode,
  title: string,
  date: string,
  fc: (n: number) => string
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
      background: #fff; color: #1a1a2e; padding: 40px; line-height: 1.6; max-width: 600px; margin: 0 auto;
    }
    .header { text-align: center; border-bottom: 3px solid #C77D3A; padding-bottom: 20px; margin-bottom: 25px; }
    .logo { font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; color: #C77D3A; }
    .logo span { color: #6B9E72; }
    .subtitle { font-size: 13px; color: #6B6572; margin-top: 4px; }
    .project-name { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 15px 0 5px; }
    .date { font-size: 12px; color: #6B6572; }
    .pieces { margin: 20px 0; }
    .piece {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-bottom: 1px solid #E8E2DA;
    }
    .piece-name { font-weight: 600; font-size: 14px; }
    .piece-detail { font-size: 11px; color: #6B6572; }
    .piece-price { font-family: 'Space Grotesk', monospace; font-weight: 700; font-size: 16px; color: #C77D3A; }
    .divider { border: none; border-top: 2px dashed #E8E2DA; margin: 15px 0; }
    .total-section { text-align: center; padding: 15px; background: #C77D3A10; border-radius: 12px; margin-top: 15px; }
    .total-label { font-size: 12px; color: #6B6572; text-transform: uppercase; letter-spacing: 1px; }
    .total-price { font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700; color: #C77D3A; margin-top: 5px; }
    .includes-iva { font-size: 11px; color: #6B9E72; margin-top: 4px; }
    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #6B6572; border-top: 1px solid #E8E2DA; padding-top: 15px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">D-<span>Calc</span></div>
    <div class="subtitle">Presupuesto de impresión 3D</div>
  </div>

  <div style="text-align: center;">
    <div class="project-name">${project.name}</div>
    <div class="date">${date}</div>
  </div>

  <div class="pieces">
    ${pricing.subPieceBreakdowns.map(b => `
    <div class="piece">
      <div>
        <div class="piece-name">${b.subPieceName}${b.quantity > 1 ? ` ×${b.quantity}` : ''}</div>
        <div class="piece-detail">Precio por unidad: ${fc(b.totalPerUnit)}</div>
      </div>
      <div class="piece-price">${fc(b.totalForQuantity)}</div>
    </div>
    `).join('')}
  </div>

  <hr class="divider" />

  ${(pricing.totalPackaging > 0 || pricing.totalShipping > 0) ? `
  <div class="piece">
    <div>
      <div class="piece-name">Embalaje y envío</div>
      <div class="piece-detail">Gastos de envío y manipulación</div>
    </div>
    <div class="piece-price">${fc(pricing.totalPackaging + pricing.totalShipping)}</div>
  </div>
  <hr class="divider" />
  ` : ''}

  <div class="total-section">
    <div class="total-label">Total del proyecto</div>
    <div class="total-price">${fc(pricing.totalProjectPrice)}</div>
    <div class="includes-iva">IVA (${project.params.taxRate}%) incluido</div>
  </div>

  <div class="footer">
    Generated by D-Calc · Válido 30 días desde ${date}
  </div>
</body>
</html>`
}
