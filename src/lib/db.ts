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

/**
 * Creates a no-op Proxy that acts as PrismaClient but does nothing.
 * Used ONLY during build time to prevent database connections during static generation.
 */
function createNoOpProxy(): PrismaClient {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (typeof prop === 'string') {
        // Return a function that resolves to a sensible default
        // For findUnique/findFirst: return null (not found)
        // For create: return a mock object with id
        // For everything else: return null
        return (..._args: unknown[]) => Promise.resolve(null)
      }
      return undefined
    },
  }
  return new Proxy({} as object, handler) as unknown as PrismaClient
}

function createPrismaClient(): PrismaClient {
  // During build: return a proxy that does nothing
  if (isBuildTime()) {
    console.log('📦 Build phase detected - using no-op PrismaClient proxy')
    return createNoOpProxy()
  }

  // Runtime: determine connection method
  const tursoUrl = process.env.TURSO_DB_URL || ''
  const databaseUrl = process.env.DATABASE_URL || ''

  // Priority 1: use Turso adapter if TURSO_DB_URL is set with libsql:// scheme
  if (tursoUrl && tursoUrl.startsWith('libsql://')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSQL } = require('@prisma/adapter-libsql') as typeof import('@prisma/adapter-libsql')

      const adapter = new PrismaLibSQL({
        url: tursoUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
      })

      console.log('✅ Connected to Turso database via TURSO_DB_URL adapter')
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
      })
    } catch (error) {
      console.error('❌ CRITICAL: Failed to create Turso client at runtime:', error)
      throw new Error(
        `Database connection failed: ${error instanceof Error ? error.message : String(error)}. ` +
        `Check TURSO_DB_URL and DATABASE_AUTH_TOKEN env vars.`
      )
    }
  }

  // Priority 2: Check DATABASE_URL for libsql:// or https:// scheme (Vercel production fallback)
  if (databaseUrl && (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('https://'))) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSQL } = require('@prisma/adapter-libsql') as typeof import('@prisma/adapter-libsql')

      const adapter = new PrismaLibSQL({
        url: databaseUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
      })

      console.log('✅ Connected to database via DATABASE_URL adapter')
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
      })
    } catch (error) {
      console.error('❌ CRITICAL: Failed to create database client at runtime:', error)
      throw new Error(
        `Database connection failed: ${error instanceof Error ? error.message : String(error)}. ` +
        `Check DATABASE_URL and DATABASE_AUTH_TOKEN env vars.`
      )
    }
  }

  // Priority 3: Local SQLite file (for development)
  if (databaseUrl && databaseUrl.startsWith('file:')) {
    console.log('✅ Connected to local SQLite database')
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    })
  }

  // No valid DB URL at runtime - this is FATAL
  console.error('❌ CRITICAL: No valid DATABASE_URL or TURSO_DB_URL set at runtime')
  console.error('Available env vars:')
  console.error('  TURSO_DB_URL:', tursoUrl ? `${tursoUrl.substring(0, 30)}...` : '(not set)')
  console.error('  DATABASE_URL:', databaseUrl ? `${databaseUrl.substring(0, 30)}...` : '(not set)')
  console.error('  DATABASE_AUTH_TOKEN:', process.env.DATABASE_AUTH_TOKEN ? '(set)' : '(not set)')

  throw new Error(
    'No valid DATABASE_URL or TURSO_DB_URL set. ' +
    'Database is required for this application to function. ' +
    'Set TURSO_DB_URL and DATABASE_AUTH_TOKEN in your environment.'
  )
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
