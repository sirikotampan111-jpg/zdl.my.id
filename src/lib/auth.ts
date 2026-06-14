import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// ─── NEXTAUTH_URL normalization ────────────────────────────────────────────────
// Ensure NEXTAUTH_URL is always correct, even if env var is misconfigured
function getNormalizedNextAuthUrl(): string {
  // IMPORTANT: Vercel redirects zdl.my.id → www.zdl.my.id (307)
  // The OAuth redirect URI must match the ACTUAL domain users end up on
  let url = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.zdl.my.id";

  // Remove trailing slashes
  url = url.replace(/\/+$/, "");

  // Ensure HTTPS in production
  if (process.env.NODE_ENV === "production" && url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }

  // Log for debugging
  if (process.env.NODE_ENV === "production") {
    console.log(`[AUTH] NEXTAUTH_URL resolved to: ${url}`);
  }

  return url;
}

// Set NEXTAUTH_URL early so NextAuth uses the correct value
// Always override if: not set, using vercel.app domain, has trailing slash, or missing www
const currentUrl = process.env.NEXTAUTH_URL || "";
const needsOverride =
  !currentUrl ||
  currentUrl.includes("vercel.app") ||
  currentUrl.endsWith("/") ||
  currentUrl === "https://zdl.my.id"; // Must be www.zdl.my.id due to Vercel redirect

if (needsOverride) {
  process.env.NEXTAUTH_URL = getNormalizedNextAuthUrl();
  console.log(`[AUTH] NEXTAUTH_URL overridden to: ${process.env.NEXTAUTH_URL}`);
}

// Default super-admin emails: fallback to hardcoded if env var not set
// This ensures the owner always has super-admin access even if env vars are missing
const SUPER_ADMIN_EMAILS = (
  process.env.SUPER_ADMIN_EMAILS || "sirikotampan111@gmail.com"
)
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

// ─── JWT Role Cache ───────────────────────────────────────────────────────────
// Caches role in-memory with a TTL to avoid DB query on every request.
// Auto-evicts when capacity is reached.

interface RoleCacheEntry {
  role: string;
  cachedAt: number;
}

const ROLE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 1000;
const roleCache = new Map<string, RoleCacheEntry>();

function getCachedRole(email: string): string | null {
  const entry = roleCache.get(email);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > ROLE_CACHE_TTL) {
    roleCache.delete(email);
    return null;
  }
  return entry.role;
}

function setCachedRole(email: string, role: string): void {
  if (roleCache.size >= MAX_CACHE_ENTRIES) {
    // Evict 20% of oldest entries
    const toDelete = Math.ceil(MAX_CACHE_ENTRIES * 0.2);
    const keys = Array.from(roleCache.keys());
    for (let i = 0; i < toDelete && i < keys.length; i++) {
      roleCache.delete(keys[i]);
    }
  }
  roleCache.set(email, { role, cachedAt: Date.now() });
}

export function invalidateRoleCache(email: string): void {
  roleCache.delete(email);
}

// ─── Helper: Check if email is super-admin ─────────────────────────────────────

function isSuperAdminEmail(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

// ─── Auth Options ─────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            throw new Error("Email atau password salah");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Email atau password salah");
          }

          // Auto-upgrade to super-admin if email is in SUPER_ADMIN_EMAILS
          let userRole = user.role;
          if (isSuperAdminEmail(user.email) && user.role !== "super-admin") {
            try {
              await db.user.update({
                where: { id: user.id },
                data: { role: "super-admin" },
              });
              userRole = "super-admin";
              invalidateRoleCache(user.email);
              console.log(`[AUTH] User ${user.email} auto-upgraded to super-admin on login`);
            } catch (upgradeError) {
              console.error("[AUTH] Failed to upgrade user to super-admin:", upgradeError);
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: userRole,
          };
        } catch (error: unknown) {
          // Re-throw known auth errors
          if (error instanceof Error && (
            error.message === "Email atau password salah" ||
            error.message === "Email dan password harus diisi"
          )) {
            throw error;
          }
          // Unknown error (likely DB connection issue)
          console.error("[AUTH] authorize() error:", error);
          throw new Error("Terjadi kesalahan server. Coba lagi nanti.");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const shouldBeSuperAdmin = isSuperAdminEmail(user.email);

        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user
            await db.user.create({
              data: {
                email: user.email,
                name: user.name || "",
                image: user.image,
                provider: "google",
                role: shouldBeSuperAdmin ? "super-admin" : "customer",
              },
            });
            console.log(`[AUTH] New Google user created: ${user.email} (role: ${shouldBeSuperAdmin ? "super-admin" : "customer"})`);
          } else if (shouldBeSuperAdmin && existingUser.role !== "super-admin") {
            // Auto-upgrade to super-admin if email is in SUPER_ADMIN_EMAILS
            await db.user.update({
              where: { id: existingUser.id },
              data: { role: "super-admin" },
            });
            invalidateRoleCache(user.email);
            console.log(`[AUTH] User ${user.email} upgraded to super-admin`);
          }

          // Update name/image if changed on Google
          if (existingUser && (existingUser.name !== (user.name || "") || existingUser.image !== user.image)) {
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
              },
            });
          }
        } catch (error) {
          console.error("[AUTH] Google signIn DB error:", error);
          // Don't block login if DB write fails — user can still authenticate
          // The role will be resolved from JWT/DB on next request
        }
      }
      return true;
    },
    async jwt({ token, user, isNewUser }) {
      // On first sign-in, fetch role from DB to ensure it's fresh
      if (user) {
        // Check if this email should be super-admin
        const shouldBeSuperAdmin = user.email ? isSuperAdminEmail(user.email) : false;
        let role = (user as { role?: string })?.role || "customer";

        // Override role if email is in SUPER_ADMIN_EMAILS
        if (shouldBeSuperAdmin && role !== "super-admin") {
          role = "super-admin";
          // Also update in DB
          try {
            await db.user.update({
              where: { email: user.email! },
              data: { role: "super-admin" },
            });
            console.log(`[AUTH] JWT: Upgraded ${user.email} to super-admin`);
          } catch (e) {
            console.error("[AUTH] JWT: Failed to upgrade role in DB:", e);
          }
        }

        token.role = role;
        token.id = user.id;
        if (user.email) {
          setCachedRole(user.email, role);
        }
        return token;
      }

      // On subsequent requests, use cached role if available
      if (token.email) {
        const email = token.email as string;

        // Always check if this email should be super-admin
        if (isSuperAdminEmail(email) && token.role !== "super-admin") {
          token.role = "super-admin";
          setCachedRole(email, "super-admin");
          // Update DB in background
          try {
            await db.user.update({
              where: { email },
              data: { role: "super-admin" },
            });
          } catch (e) {
            console.error("[AUTH] JWT: Failed to upgrade role in DB:", e);
          }
          return token;
        }

        const cachedRole = getCachedRole(email);
        if (cachedRole) {
          token.role = cachedRole;
        } else {
          // Cache miss — fetch from DB
          try {
            const dbUser = await db.user.findUnique({
              where: { email },
              select: { role: true },
            });
            if (dbUser) {
              token.role = dbUser.role;
              setCachedRole(email, dbUser.role);
            }
          } catch (error) {
            console.error("[AUTH] JWT role fetch error:", error);
            // Keep existing token role if DB is temporarily unavailable
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
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
