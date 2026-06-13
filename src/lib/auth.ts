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
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // On first sign-in, fetch role from DB to ensure it's fresh
      if (user) {
        token.role = (user as { role?: string })?.role || "customer";
        token.id = user.id;
      }

      // Always refresh role from DB on subsequent requests (handles role changes)
      if (token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
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
