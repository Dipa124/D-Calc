import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET /api/sales — List sales with optional filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const where: Prisma.SaleWhereInput = { userId: session.user.id }

    if (projectId) {
      where.projectId = projectId
    }

    if (dateFrom || dateTo) {
      where.soldAt = {}
      if (dateFrom) {
        where.soldAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.soldAt.lte = new Date(dateTo)
      }
    }

    const sales = await db.sale.findMany({
      where,
      orderBy: { soldAt: 'desc' },
      include: {
        project: { select: { name: true } },
      },
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error listing sales:', error)
    return NextResponse.json({ error: 'Error al obtener ventas' }, { status: 500 })
  }
}

// POST /api/sales — Record a new sale
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, projectName, tier, saleType, quantity, unitPrice, totalPrice, notes } = body

    if (!projectId || !projectName || !tier || !saleType || quantity === undefined || unitPrice === undefined || totalPrice === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await db.project.findUnique({
      where: { id: projectId },
    })

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Proyecto no encontrado o no autorizado' }, { status: 403 })
    }

    const sale = await db.sale.create({
      data: {
        userId: session.user.id,
        projectId,
        projectName,
        tier,
        saleType,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        totalPrice: Number(totalPrice),
        notes: notes || null,
      },
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Error recording sale:', error)
    return NextResponse.json({ error: 'Error al registrar venta' }, { status: 500 })
  }
}
