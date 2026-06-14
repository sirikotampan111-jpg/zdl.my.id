import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we're in build phase (no real DB connection needed)
function isBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_BUILD === '1' ||
    (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && typeof window === 'undefined' && !process.env.TURSO_DB_URL && !process.env.DATABASE_URL?.startsWith('libsql'))
  )
}

function createPrismaClient(): PrismaClient {
  // During build: skip ALL database connections
  if (isBuildTime()) {
    return new PrismaClient({
      log: ['error'],
      __internal: { engine: { override: { datasourceUrl: 'file:/tmp/build-placeholder.db' } } },
    } as any)
  }

  // Runtime: dynamically import adapters to avoid build-time errors
  try {
    const tursoUrl = process.env.TURSO_DB_URL || ''
    const databaseUrl = process.env.DATABASE_URL || ''
    const remoteUrl = tursoUrl || databaseUrl

    if (remoteUrl && (remoteUrl.startsWith('libsql://') || remoteUrl.startsWith('https://'))) {
      // Dynamic require to avoid build-time evaluation
      const { createClient } = require('@libsql/client') as typeof import('@libsql/client')
      const { PrismaLibSql } = require('@prisma/adapter-libsql') as typeof import('@prisma/adapter-libsql')

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

    if (databaseUrl && databaseUrl.startsWith('file:')) {
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
      })
    }
  } catch (error) {
    console.warn('⚠️ Failed to create Turso client, falling back:', error)
  }

  // Fallback: placeholder client for build time
  return new PrismaClient({
    log: ['error'],
    __internal: { engine: { override: { datasourceUrl: 'file:/tmp/fallback.db' } } },
  } as any)
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
