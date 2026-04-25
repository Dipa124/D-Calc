import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test account: demo@dcalc.app / demo123
  const existing = await prisma.user.findUnique({ where: { email: 'demo@dcalc.app' } })
  
  if (!existing) {
    const hashedPassword = await bcrypt.hash('demo123', 10)
    const user = await prisma.user.create({
      data: {
        email: 'demo@dcalc.app',
        name: 'Demo User',
        password: hashedPassword,
      },
    })
    console.log('✅ Test account created:', user.email)
    console.log('   Password: demo123')
  } else {
    console.log('ℹ️  Test account already exists:', existing.email)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
