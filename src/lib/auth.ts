import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";

const SUPER_ADMIN_EMAILS = (
  process.env.SUPER_ADMIN_EMAILS || ""
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
    }),
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
          // Invalidate cache so next request gets fresh role
          invalidateRoleCache(user.email);
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
          const dbUser = await db.user.findUnique({
            where: { email: token.email as string },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            setCachedRole(token.email as string, dbUser.role);
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
  },
  secret: process.env.NEXTAUTH_SECRET,
};
