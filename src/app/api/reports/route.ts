import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reportType, projectData, pricingData, currency, userId } = body

    if (!reportType || !projectData || !pricingData) {
      return NextResponse.json(
        { error: 'Missing required fields: reportType, projectData, pricingData' },
        { status: 400 }
      )
    }

    if (reportType !== 'producer' && reportType !== 'invoice') {
      return NextResponse.json(
        { error: 'reportType must be "producer" or "invoice"' },
        { status: 400 }
      )
    }

    const report = await db.sharedReport.create({
      data: {
        userId: userId || null,
        reportType,
        projectData: typeof projectData === 'string' ? projectData : JSON.stringify(projectData),
        pricingData: typeof pricingData === 'string' ? pricingData : JSON.stringify(pricingData),
        currency: currency || 'EUR',
        expiresAt: null, // No expiration by default
      },
    })

    const url = `/api/reports/${report.id}`

    return NextResponse.json({ id: report.id, url }, { status: 201 })
  } catch (error) {
    console.error('Error creating shared report:', error)
    return NextResponse.json(
      { error: 'Failed to create shared report' },
      { status: 500 }
    )
  }
}
