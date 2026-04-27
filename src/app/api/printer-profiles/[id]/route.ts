import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT /api/printer-profiles/[id] — Update a printer profile
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()

    // Verify ownership
    const existing = await db.printerProfile.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await db.printerProfile.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const profile = await db.printerProfile.update({
      where: { id },
      data: {
        name: body.name,
        model: body.model,
        price: body.price !== undefined ? Number(body.price) : undefined,
        expectedLifespanYears: body.expectedLifespanYears !== undefined ? Number(body.expectedLifespanYears) : undefined,
        powerConsumptionWatts: body.powerConsumptionWatts !== undefined ? Number(body.powerConsumptionWatts) : undefined,
        failureRate: body.failureRate !== undefined ? Number(body.failureRate) : undefined,
        maintenanceCostPerHour: body.maintenanceCostPerHour !== undefined ? Number(body.maintenanceCostPerHour) : undefined,
        isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : undefined,
      },
    })

    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

// DELETE /api/printer-profiles/[id] — Delete a printer profile
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Verify ownership
  const existing = await db.printerProfile.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.printerProfile.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
