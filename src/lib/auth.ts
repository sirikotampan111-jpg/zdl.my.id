import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Ensure NEXTAUTH_URL has a fallback for SSR/build
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zdl.my.id";
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
          response_type: "code",
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

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
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

        const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());

        try {
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
            console.log(`[AUTH] New Google user created: ${user.email}`);
          } else if (isSuperAdmin && existingUser.role !== "super-admin") {
            // Auto-upgrade to super-admin if email is in SUPER_ADMIN_EMAILS
            await db.user.update({
              where: { id: existingUser.id },
              data: { role: "super-admin" },
            });
            // Invalidate cache so next request gets fresh role
            invalidateRoleCache(user.email);
            console.log(`[AUTH] User ${user.email} upgraded to super-admin`);
          }
        } catch (error) {
          console.error("[AUTH] Google signIn DB error:", error);
          // Don't block login if DB write fails — user can still authenticate
          // The role will be resolved from JWT/DB on next request
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // On first sign-in, fetch role from DB to ensure it's fresh
      if (user) {
        token.role = (user as { role?: string })?.role || "customer";
        token.id = user.id;
        if (user.email) {
          setCachedRole(user.email, token.role as string);
        }
        return token;
      }

      // On subsequent requests, use cached role if available
      if (token.email) {
        const cachedRole = getCachedRole(token.email as string);
        if (cachedRole) {
          token.role = cachedRole;
        } else {
          // Cache miss — fetch from DB
          try {
            const dbUser = await db.user.findUnique({
              where: { email: token.email as string },
              select: { role: true },
            });
            if (dbUser) {
              token.role = dbUser.role;
              setCachedRole(token.email as string, dbUser.role);
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
