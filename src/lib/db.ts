import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In development, always create a fresh client to pick up schema changes
export const db =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] }))
    : new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV === 'production') globalForPrisma.prisma = db