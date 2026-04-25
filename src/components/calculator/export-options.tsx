'use client'

import { motion } from 'framer-motion'
import type { Project, ProjectPricingResult } from '@/lib/types'
import { PRICING_TIER_CONFIG } from '@/lib/types'
import { formatCurrency } from '@/lib/calculator'
import { FileText, Ticket } from 'lucide-react'

interface ExportOptionsProps {
  project: Project
  selectedResult: ProjectPricingResult
}

export function ExportOptions({ project, selectedResult }: ExportOptionsProps) {
  const generateProducerReport = () => {
    const tierConfig = PRICING_TIER_CONFIG[selectedResult.tier]
    const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Productor — ${project.name}</title>
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
      background: ${tierConfig.darkAccent}20; color: ${tierConfig.darkAccent};
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
      <div class="logo">Calc<span>FDM</span></div>
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
    <div class="tier-badge">${tierConfig.label} — Margen ${(selectedResult.profitMargin * 100).toFixed(0)}%</div>
  </div>

  <div class="section">
    <div class="section-title">Parámetros de impresión</div>
    <div class="param-grid">
      <div class="param-item"><div class="param-label">Impresora</div><div class="param-value">${project.params.printerCost}€</div></div>
      <div class="param-item"><div class="param-label">Vida útil</div><div class="param-value">${project.params.printerLifespanHours}h</div></div>
      <div class="param-item"><div class="param-label">Consumo</div><div class="param-value">${project.params.powerConsumptionWatts}W</div></div>
      <div class="param-item"><div class="param-label">Electricidad</div><div class="param-value">${project.params.electricityCostPerKWh}€/kWh</div></div>
      <div class="param-item"><div class="param-label">Mano obra</div><div class="param-value">${project.params.laborCostPerHour}€/h</div></div>
      <div class="param-item"><div class="param-label">IVA</div><div class="param-value">${project.params.taxRate}%</div></div>
      <div class="param-item"><div class="param-label">Tasa fallo</div><div class="param-value">${project.params.failureRate}%</div></div>
      <div class="param-item"><div class="param-label">Overhead</div><div class="param-value">${project.params.overheadPercentage}%</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Desglose por subpieza</div>
    ${selectedResult.subPieceBreakdowns.map(b => `
    <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 15px; margin: 15px 0 8px;">${b.subPieceName} ×${b.quantity}</h3>
    <table>
      <thead><tr><th>Concepto</th><th style="text-align:right;">Importe</th></tr></thead>
      <tbody>
        <tr><td>Material (con desperdicio)</td><td class="amount">${formatCurrency(b.materialCost)}</td></tr>
        <tr><td>Depreciación impresora</td><td class="amount">${formatCurrency(b.printerDepreciation)}</td></tr>
        <tr><td>Electricidad</td><td class="amount">${formatCurrency(b.electricityCost)}</td></tr>
        <tr><td>Mantenimiento</td><td class="amount">${formatCurrency(b.maintenanceCost)}</td></tr>
        <tr><td>Mano de obra</td><td class="amount">${formatCurrency(b.laborCost)}</td></tr>
        <tr><td>Acabado</td><td class="amount">${formatCurrency(b.finishingCost)}</td></tr>
        <tr><td>Riesgo de fallo</td><td class="amount">${formatCurrency(b.failureCost)}</td></tr>
        <tr class="total-row"><td>Subtotal/unidad</td><td class="amount">${formatCurrency(b.subtotalPerUnit)}</td></tr>
        <tr><td>Overhead/unidad</td><td class="amount">${formatCurrency(b.overheadPerUnit)}</td></tr>
        <tr class="total-row"><td>Coste base/unidad</td><td class="amount">${formatCurrency(b.baseCostPerUnit)}</td></tr>
        <tr><td>Beneficio/unidad</td><td class="amount">${formatCurrency(b.profitPerUnit)}</td></tr>
        <tr><td>IVA/unidad</td><td class="amount">${formatCurrency(b.taxPerUnit)}</td></tr>
        <tr class="grand-total"><td>Total/unidad</td><td class="amount">${formatCurrency(b.totalPerUnit)}</td></tr>
        <tr class="grand-total"><td>Total ×${b.quantity}</td><td class="amount">${formatCurrency(b.totalForQuantity)}</td></tr>
      </tbody>
    </table>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">Resumen del proyecto</div>
    <table>
      <tbody>
        <tr><td>Coste total material</td><td class="amount">${formatCurrency(selectedResult.totalMaterialCost)}</td></tr>
        <tr><td>Coste base total</td><td class="amount">${formatCurrency(selectedResult.totalBaseCost)}</td></tr>
        <tr><td>Beneficio total</td><td class="amount">${formatCurrency(selectedResult.totalProfit)}</td></tr>
        <tr><td>Precio sin IVA</td><td class="amount">${formatCurrency(selectedResult.totalPriceBeforeTax)}</td></tr>
        <tr><td>IVA (${project.params.taxRate}%)</td><td class="amount">${formatCurrency(selectedResult.totalTax)}</td></tr>
        ${selectedResult.totalPackaging > 0 ? `<tr><td>Embalaje</td><td class="amount">${formatCurrency(selectedResult.totalPackaging)}</td></tr>` : ''}
        ${selectedResult.totalShipping > 0 ? `<tr><td>Envío</td><td class="amount">${formatCurrency(selectedResult.totalShipping)}</td></tr>` : ''}
        <tr class="grand-total"><td>PRECIO TOTAL DEL PROYECTO</td><td class="amount" style="font-size:20px;">${formatCurrency(selectedResult.totalProjectPrice)}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    Reporte generado por CalcFDM — Calculadora profesional de impresión 3D FDM · ${date}
  </div>
</body>
</html>`

    printHtml(html, `Reporte_${project.name}_Productor`)
  }

  const generateBuyerTicket = () => {
    const tierConfig = PRICING_TIER_CONFIG[selectedResult.tier]
    const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presupuesto — ${project.name}</title>
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
    <div class="logo">Calc<span>FDM</span></div>
    <div class="subtitle">Presupuesto de impresión 3D</div>
  </div>

  <div style="text-align: center;">
    <div class="project-name">${project.name}</div>
    <div class="date">${date}</div>
  </div>

  <div class="pieces">
    ${selectedResult.subPieceBreakdowns.map(b => `
    <div class="piece">
      <div>
        <div class="piece-name">${b.subPieceName}${b.quantity > 1 ? ` ×${b.quantity}` : ''}</div>
        <div class="piece-detail">Precio por unidad: ${formatCurrency(b.totalPerUnit)}</div>
      </div>
      <div class="piece-price">${formatCurrency(b.totalForQuantity)}</div>
    </div>
    `).join('')}
  </div>

  <hr class="divider" />

  ${(selectedResult.totalPackaging > 0 || selectedResult.totalShipping > 0) ? `
  <div class="piece">
    <div>
      <div class="piece-name">Embalaje y envío</div>
      <div class="piece-detail">Gastos de envío y manipulación</div>
    </div>
    <div class="piece-price">${formatCurrency(selectedResult.totalPackaging + selectedResult.totalShipping)}</div>
  </div>
  <hr class="divider" />
  ` : ''}

  <div class="total-section">
    <div class="total-label">Total del proyecto</div>
    <div class="total-price">${formatCurrency(selectedResult.totalProjectPrice)}</div>
    <div class="includes-iva">IVA (${project.params.taxRate}%) incluido</div>
  </div>

  <div class="footer">
    Presupuesto generado por CalcFDM · Válido 30 días desde ${date}
  </div>
</body>
</html>`

    printHtml(html, `Presupuesto_${project.name}`)
  }

  /**
   * Print HTML using a hidden iframe to avoid "about:blank" appearing
   * in the printed document's footer/header.
   */
  const printHtml = (html: string, title: string) => {
    // Create a hidden iframe
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.title = title
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (!doc) {
      document.body.removeChild(iframe)
      // Fallback: download as HTML file
      downloadHtml(html, title)
      return
    }

    doc.open()
    doc.write(html)
    doc.close()

    // Wait for content to render, then print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch {
        // If print fails, fall back to download
        downloadHtml(html, title)
      }
      // Clean up the iframe after a delay
      setTimeout(() => {
        try { document.body.removeChild(iframe) } catch { /* already removed */ }
      }, 1000)
    }, 400)
  }

  const downloadHtml = (html: string, title: string) => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <motion.button
        onClick={generateProducerReport}
        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl
          bg-copper/15 border border-copper/30 text-copper font-display font-semibold text-sm
          hover:bg-copper/25 hover:shadow-lg hover:shadow-copper/10 transition-all"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <FileText className="w-4 h-4" />
        Reporte productor
      </motion.button>

      <motion.button
        onClick={generateBuyerTicket}
        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl
          bg-sage/15 border border-sage/30 text-sage dark:text-sage-light font-display font-semibold text-sm
          hover:bg-sage/25 hover:shadow-lg hover:shadow-sage/10 transition-all"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <Ticket className="w-4 h-4" />
        Presupuesto comprador
      </motion.button>
    </div>
  )
}
