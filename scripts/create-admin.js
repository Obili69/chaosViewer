#!/usr/bin/env node
/**
 * Creates the initial admin user.
 * Usage: node scripts/create-admin.js <username> <password>
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const [,, username, password] = process.argv
  if (!username || !password) {
    console.error('Usage: node scripts/create-admin.js <username> <password>')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      console.log(`Benutzer "${username}" existiert bereits.`)
      process.exit(0)
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { username, passwordHash, role: 'ADMIN' },
    })
    console.log(`Admin-Benutzer "${user.username}" erfolgreich erstellt.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
