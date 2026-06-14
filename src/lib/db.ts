import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we're in build phase
function isBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    !!process.env.NEXT_BUILD
  )
}

function createPrismaClient(): PrismaClient {
  // During build: return a proxy that does nothing
  // This avoids ANY database connection during static page generation
  if (isBuildTime()) {
    console.log('📦 Build phase detected - using no-op PrismaClient proxy')
    return createNoOpProxy()
  }

  // Runtime: connect to Turso
  const tursoUrl = process.env.TURSO_DB_URL || ''
  const databaseUrl = process.env.DATABASE_URL || ''
  const remoteUrl = tursoUrl || databaseUrl

  if (remoteUrl && (remoteUrl.startsWith('libsql://') || remoteUrl.startsWith('https://'))) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('@libsql/client') as typeof import('@libsql/client')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
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
    } catch (error) {
      console.error('❌ Failed to create Turso client:', error)
      return createNoOpProxy()
    }
  }

  // Local SQLite file
  if (databaseUrl && databaseUrl.startsWith('file:')) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    })
  }

  // No valid DB URL
  console.warn('⚠️ No valid DATABASE_URL or TURSO_DB_URL set')
  return createNoOpProxy()
}

/**
 * Creates a Proxy that acts as PrismaClient but does nothing.
 * Used during build time to prevent any database connections.
 */
function createNoOpProxy(): PrismaClient {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      // Return noop functions for common Prisma methods
      if (typeof prop === 'string') {
        // These return promises that resolve to null/empty
        return () => Promise.resolve(null)
      }
      return undefined
    },
  }
  return new Proxy({} as object, handler) as unknown as PrismaClient
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
