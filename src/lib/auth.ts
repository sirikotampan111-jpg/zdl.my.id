import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { validateEnv } from "@/lib/env-check";

// Validate critical environment variables at module load time
// During build, this only warns — it throws at runtime in production
validateEnv();

// SECURITY: No hardcoded fallback — SUPER_ADMIN_EMAILS must be explicitly set
// Empty string means no super-admins via env var (admin setup route can still create one)
const SUPER_ADMIN_EMAILS = (
  process.env.SUPER_ADMIN_EMAILS || ""
)
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter((e: string) => e.length > 0);

// SECURITY: Validate Google OAuth credentials
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  // Only warn — don't throw during build. Runtime validation is in validateEnv()
  console.warn("[AUTH] Google OAuth credentials not set. Google login will not work.");
}

// ========== JWT Role Cache ==========
// Caches user roles with a TTL to avoid querying the database on every single
// JWT refresh. The JWT callback is invoked on every authenticated request, and
// without caching, this would result in a DB query per request — a performance
// bottleneck under load. Cache TTL is 5 minutes, balancing freshness with
// performance. Role changes (e.g., admin demotion) take up to 5 minutes to
// propagate, which is acceptable for this application.
const ROLE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const roleCache = new Map<string, { role: string; expiresAt: number }>();

function getCachedRole(email: string): string | null {
  const cached = roleCache.get(email);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    roleCache.delete(email);
    return null;
  }
  return cached.role;
}

function setCachedRole(email: string, role: string): void {
  // Limit cache size to prevent memory leaks in long-running processes
  if (roleCache.size > 10000) {
    // Evict oldest entries (first 20%)
    const keysToDelete = Array.from(roleCache.keys()).slice(0, Math.ceil(roleCache.size * 0.2));
    for (const key of keysToDelete) {
      roleCache.delete(key);
    }
  }
  roleCache.set(email, { role, expiresAt: Date.now() + ROLE_CACHE_TTL });
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Only configure Google provider if credentials are available
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());

        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              image: user.image,
              provider: "google",
              role: isSuperAdmin ? "super-admin" : "customer",
            },
          });
        } else if (isSuperAdmin && existingUser.role !== "super-admin") {
          // Auto-upgrade to super-admin if email is in SUPER_ADMIN_EMAILS
          await db.user.update({
            where: { id: existingUser.id },
            data: { role: "super-admin" },
          });
          // Invalidate cache so the role update takes effect immediately
          setCachedRole(user.email, "super-admin");
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // On first sign-in, fetch role from DB to ensure it's fresh
      if (user) {
        token.role = (user as { role?: string })?.role || "customer";
        token.id = user.id;
        // Cache the initial role
        if (user.email) {
          setCachedRole(user.email, token.role as string);
        }
      }

      // Refresh role from DB on subsequent requests, with caching
      // to avoid a DB query on every single request
      if (token.email) {
        const email = token.email as string;
        const cachedRole = getCachedRole(email);
        if (cachedRole) {
          token.role = cachedRole;
        } else {
          // Cache miss — query DB and update cache
          const dbUser = await db.user.findUnique({
            where: { email },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            setCachedRole(email, dbUser.role);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // Max session age — 24 hours for security
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
