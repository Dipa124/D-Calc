import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/sales/stats — Dashboard statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userId = session.user.id

    // Total revenue
    const totalRevenueResult = await db.sale.aggregate({
      where: { userId },
      _sum: { totalPrice: true },
      _count: true,
    })

    // Total projects
    const totalProjects = await db.project.count({
      where: { userId },
    })

    // Average price per sale
    const salesCount = totalRevenueResult._count
    const totalRevenue = totalRevenueResult._sum.totalPrice || 0
    const avgPrice = salesCount > 0 ? totalRevenue / salesCount : 0

    // Recent sales (last 5)
    const recentSales = await db.sale.findMany({
      where: { userId },
      orderBy: { soldAt: 'desc' },
      take: 5,
    })

    // Monthly breakdown (last 6 months)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const sales = await db.sale.findMany({
      where: {
        userId,
        soldAt: { gte: sixMonthsAgo },
      },
      select: {
        totalPrice: true,
        soldAt: true,
      },
    })

    // Group by month
    const monthlyBreakdown: { month: string; revenue: number; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = monthDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const monthSales = sales.filter(s => {
        const soldAt = new Date(s.soldAt)
        return soldAt >= monthStart && soldAt <= monthEnd
      })

      monthlyBreakdown.push({
        month: monthKey,
        revenue: monthSales.reduce((sum, s) => sum + s.totalPrice, 0),
        count: monthSales.length,
      })
    }

    // Sales by tier
    const allSales = await db.sale.findMany({
      where: { userId },
      select: { tier: true, totalPrice: true },
    })

    const salesByTier: Record<string, { revenue: number; count: number }> = {}
    for (const sale of allSales) {
      if (!salesByTier[sale.tier]) {
        salesByTier[sale.tier] = { revenue: 0, count: 0 }
      }
      salesByTier[sale.tier].revenue += sale.totalPrice
      salesByTier[sale.tier].count += 1
    }

    return NextResponse.json({
      totalRevenue,
      totalProjects,
      totalSales: salesCount,
      avgPrice,
      recentSales,
      monthlyBreakdown,
      salesByTier,
    })
  } catch (error) {
    console.error('Error getting stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
