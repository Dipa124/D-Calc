import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/projects — List user's projects
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const projects = await db.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { sales: true } },
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error listing projects:', error)
    return NextResponse.json({ error: 'Error al obtener proyectos' }, { status: 500 })
  }
}

// POST /api/projects — Create a new project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { name, data } = body

    if (!name || !data) {
      return NextResponse.json(
        { error: 'Nombre y datos del proyecto son obligatorios' },
        { status: 400 }
      )
    }

    const project = await db.project.create({
      data: {
        userId: session.user.id,
        name,
        data: typeof data === 'string' ? data : JSON.stringify(data),
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Error al crear proyecto' }, { status: 500 })
  }
}
