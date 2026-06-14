import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Runtime: prefer TURSO_DB_URL (libsql://) for the adapter
  // CLI (prisma db push/migrate): uses DATABASE_URL (file:./db/local.db)
  const tursoUrl = process.env.TURSO_DB_URL || ''
  const databaseUrl = process.env.DATABASE_URL || ''

  // Skip DB connection during build time
  if (!tursoUrl && !databaseUrl) {
    console.warn('⚠️ No DATABASE_URL or TURSO_DB_URL set, using fallback PrismaClient')
    return new PrismaClient({
      log: ['error'],
    })
  }

  // Turso/libSQL connection (runtime) - prefer TURSO_DB_URL
  const remoteUrl = tursoUrl || databaseUrl
  if (remoteUrl.startsWith('libsql://') || remoteUrl.startsWith('https://')) {
    const libsql = createClient({
      url: remoteUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    })

    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    })
  }

  // Fallback: local SQLite file (DATABASE_URL = file:./db/local.db)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
