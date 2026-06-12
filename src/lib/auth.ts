import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";

const SUPER_ADMIN_EMAILS = (
  process.env.SUPER_ADMIN_EMAILS || "sirikotampan111@gmail.com"
)
  .split(",")
  .map((e: string) => e.trim().toLowerCase());

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
  },
  secret: process.env.NEXTAUTH_SECRET,
};
