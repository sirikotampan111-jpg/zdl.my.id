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

  // Turso/libSQL connection (runtime) - prefer TURSO_DB_URL
  const remoteUrl = tursoUrl || databaseUrl
  if (remoteUrl && (remoteUrl.startsWith('libsql://') || remoteUrl.startsWith('https://'))) {
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
  if (databaseUrl && databaseUrl.startsWith('file:')) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    })
  }

  // No valid DB URL found (build time / missing env) - return a mock client
  // This prevents crashes during static page generation
  console.warn('⚠️ No valid DATABASE_URL or TURSO_DB_URL set, using mock PrismaClient')
  return new PrismaClient({
    log: ['error'],
    __internal: { engine: { override: { datasourceUrl: 'file:/tmp/fallback.db' } } },
  } as any)
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
