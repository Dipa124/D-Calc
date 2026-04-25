import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/printer-profiles — List user's printer profiles
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profiles = await db.printerProfile.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json(profiles)
}

// POST /api/printer-profiles — Create a new printer profile
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      name, model, price, expectedLifespanYears,
      powerConsumptionWatts, failureRate, maintenanceCostPerHour, isDefault,
    } = body

    if (!name || !model) {
      return NextResponse.json({ error: 'Name and model are required' }, { status: 400 })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.printerProfile.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const profile = await db.printerProfile.create({
      data: {
        userId: session.user.id,
        name,
        model,
        price: Number(price) || 300,
        expectedLifespanYears: Number(expectedLifespanYears) || 2.5,
        powerConsumptionWatts: Number(powerConsumptionWatts) || 200,
        failureRate: Number(failureRate) || 5,
        maintenanceCostPerHour: Number(maintenanceCostPerHour) || 0.10,
        isDefault: Boolean(isDefault),
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
