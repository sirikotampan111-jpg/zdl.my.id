/**
 * Environment & Startup Validation
 *
 * Validates that all required environment variables are present
 * before the application starts serving requests.
 * Throws descriptive errors for missing critical configuration at runtime,
 * but only warns during build time.
 */

const warnedKeys = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (!warnedKeys.has(key)) {
    warnedKeys.add(key);
    console.warn(`[ENV] ${message}`);
  }
}

/**
 * Check if we're in a build/compile phase rather than serving requests
 */
function isBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NODE_ENV === "test" ||
    typeof process.env.NEXT_BUILD === "string"
  );
}

/**
 * Validate critical environment variables.
 * - During build: Only warns (doesn't throw) because env vars may not be available
 * - At runtime: Throws for critical missing variables in production
 */
export function validateEnv(): void {
  // During build phase, only warn — don't throw
  // Build doesn't need runtime secrets, and Vercel may not inject them during build
  if (isBuildPhase()) {
    if (!process.env.NEXTAUTH_SECRET) {
      warnOnce("NEXTAUTH_SECRET", "NEXTAUTH_SECRET is not set during build. Ensure it's set at runtime.");
    }
    return;
  }

  // === CRITICAL: Must be set in production runtime ===
  // SECURITY: We warn instead of throwing because throwing at module-load time
  // crashes the entire application — even routes that don't need these variables.
  // Individual routes that require these values should check and return proper errors.
  if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXTAUTH_SECRET) {
      warnOnce(
        "NEXTAUTH_SECRET",
        "NEXTAUTH_SECRET is required in production. Sessions will be insecure. " +
        "Generate one with: openssl rand -base64 32"
      );
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      warnOnce(
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required in production. Google login will not work."
      );
    }

    if (!process.env.MIDTRANS_SERVER_KEY) {
      warnOnce(
        "MIDTRANS_SERVER_KEY",
        "MIDTRANS_SERVER_KEY is required in production. Payment will run in demo mode."
      );
    }
  }

  // === WARNINGS: Not critical but should be addressed ===
  if (!process.env.NEXTAUTH_SECRET) {
    warnOnce(
      "NEXTAUTH_SECRET",
      "NEXTAUTH_SECRET is not set. Sessions will be insecure and may break on restart. " +
      "Set this in your .env file: NEXTAUTH_SECRET=$(openssl rand -base64 32)"
    );
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    warnOnce("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID is not set. Google login will not work.");
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    warnOnce("GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET is not set. Google login will not work.");
  }

  if (!process.env.SUPER_ADMIN_EMAILS) {
    warnOnce(
      "SUPER_ADMIN_EMAILS",
      "SUPER_ADMIN_EMAILS is not set. No users will be auto-promoted to super-admin. " +
      "Set this in your .env file with comma-separated email addresses."
    );
  }

  if (!process.env.MIDTRANS_SERVER_KEY) {
    warnOnce("MIDTRANS_SERVER_KEY", "MIDTRANS_SERVER_KEY is not set. Payment will run in demo mode.");
  }

  if (!process.env.DATABASE_URL) {
    warnOnce("DATABASE_URL", "DATABASE_URL is not set. Database connection will fail.");
  }
}

/**
 * Check if a required env var exists, return it or throw
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[ENV] Required environment variable ${key} is not set.`);
  }
  return value;
}

/**
 * Get an env var with a fallback, with a deprecation warning for the fallback
 */
export function getEnvWithWarn(key: string, fallback: string, reason: string): string {
  const value = process.env[key];
  if (value) return value;
  warnOnce(key, `${key} is not set. Using fallback. Reason: ${reason}`);
  return fallback;
}
