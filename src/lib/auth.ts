import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// ─── NEXTAUTH_URL normalization ────────────────────────────────────────────────
// Ensure NEXTAUTH_URL is always correct, even if env var is misconfigured
// IMPORTANT: Vercel redirects zdl.my.id → www.zdl.my.id (307)
// The OAuth redirect URI must match the ACTUAL domain users end up on
const CORRECT_URL = "https://www.zdl.my.id";

function getNormalizedNextAuthUrl(): string {
  let url = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || CORRECT_URL;

  // Remove trailing slashes
  url = url.replace(/\/+$/, "");

  // Ensure HTTPS in production
  if (process.env.NODE_ENV === "production" && url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }

  // Force www for zdl.my.id (Vercel redirects to www)
  if (url === "https://zdl.my.id" || url === "http://zdl.my.id") {
    url = CORRECT_URL;
  }

  return url;
}

// Set NEXTAUTH_URL early so NextAuth uses the correct value
const currentUrl = process.env.NEXTAUTH_URL || "";
const needsOverride =
  !currentUrl ||
  currentUrl.includes("vercel.app") ||
  currentUrl.endsWith("/") ||
  currentUrl === "https://zdl.my.id" ||
  currentUrl === "http://zdl.my.id";

if (needsOverride) {
  process.env.NEXTAUTH_URL = getNormalizedNextAuthUrl();
}

// Also fix NEXT_PUBLIC_SITE_URL for consistency
if (
  !process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL === "https://zdl.my.id" ||
  process.env.NEXT_PUBLIC_SITE_URL === "http://zdl.my.id"
) {
  process.env.NEXT_PUBLIC_SITE_URL = CORRECT_URL;
}

// Default super-admin emails: fallback to hardcoded if env var not set
const SUPER_ADMIN_EMAILS = (
  process.env.SUPER_ADMIN_EMAILS || "sirikotampan111@gmail.com"
)
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

// ─── JWT Role Cache ───────────────────────────────────────────────────────────

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
      // Use default authorization params - don't override
      // Removing prompt: "consent" and access_type: "offline" as they can
      // cause OAuthCallback errors with some Google Cloud Console configs
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
          if (error instanceof Error && (
            error.message === "Email atau password salah" ||
            error.message === "Email dan password harus diisi"
          )) {
            throw error;
          }
          console.error("[AUTH] authorize() error:", error);
          throw new Error("Terjadi kesalahan server. Coba lagi nanti.");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) {
          console.error("[AUTH] Google signIn blocked: no email in user object");
          return false;
        }

        console.log(`[AUTH] Google signIn attempt: ${user.email}`);
        const shouldBeSuperAdmin = isSuperAdminEmail(user.email);

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
                role: shouldBeSuperAdmin ? "super-admin" : "customer",
              },
            });
            console.log(`[AUTH] New Google user created: ${user.email} (role: ${shouldBeSuperAdmin ? "super-admin" : "customer"})`);
          } else if (shouldBeSuperAdmin && existingUser.role !== "super-admin") {
            await db.user.update({
              where: { id: existingUser.id },
              data: { role: "super-admin" },
            });
            invalidateRoleCache(user.email);
            console.log(`[AUTH] User ${user.email} upgraded to super-admin`);
          }

          // Update name/image if changed on Google
          if (existingUser && (existingUser.name !== (user.name || "") || existingUser.image !== user.image)) {
            try {
              await db.user.update({
                where: { id: existingUser.id },
                data: {
                  name: user.name || existingUser.name,
                  image: user.image || existingUser.image,
                },
              });
            } catch (e) {
              console.error("[AUTH] Failed to update user profile:", e);
            }
          }
        } catch (error) {
          console.error("[AUTH] Google signIn DB error:", error);
          // IMPORTANT: Don't block login if DB write fails
          // The user can still authenticate, role will be resolved later
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // On first sign-in, fetch role from DB to ensure it's fresh
      if (user) {
        const shouldBeSuperAdmin = user.email ? isSuperAdminEmail(user.email) : false;
        let role = (user as { role?: string })?.role || "customer";

        // Override role if email is in SUPER_ADMIN_EMAILS
        if (shouldBeSuperAdmin && role !== "super-admin") {
          role = "super-admin";
          try {
            await db.user.update({
              where: { email: user.email! },
              data: { role: "super-admin" },
            });
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
