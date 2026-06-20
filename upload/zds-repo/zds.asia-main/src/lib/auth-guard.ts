import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/lib/validations";

// ========== Auth Helpers ==========

interface AuthResult {
  authorized: boolean;
  session: Awaited<ReturnType<typeof getServerSession>> | null;
  userId?: string;
  role?: string;
  error?: string;
  status?: number;
}

/** Check if user is authenticated */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, session: null, error: "Unauthorized", status: 401 };
  }

  const userId = (session.user as { id?: string })?.id;
  const role = (session.user as { role?: string })?.role;

  if (!userId) {
    return { authorized: false, session: null, error: "Unauthorized", status: 401 };
  }

  return { authorized: true, session, userId, role };
}

/** Check if user has required role */
export async function requireRole(...roles: Role[]): Promise<AuthResult> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth;

  if (!auth.role || !roles.includes(auth.role as Role)) {
    return {
      authorized: false,
      session: auth.session,
      error: "Forbidden",
      status: 403,
    };
  }

  return auth;
}

/** Check if user is admin or super-admin */
export async function requireAdmin(): Promise<AuthResult> {
  return requireRole("admin", "super-admin");
}

/** Check if user is super-admin */
export async function requireSuperAdmin(): Promise<AuthResult> {
  return requireRole("super-admin");
}

/** Verify resource ownership — user can only access their own data unless admin */
export function canAccessResource(
  authUserId: string,
  resourceUserId: string,
  userRole?: string
): boolean {
  if (userRole === "super-admin" || userRole === "admin") return true;
  return authUserId === resourceUserId;
}

// ========== Safe Error Response ==========

/** Return a safe error response without exposing internal details */
export function safeErrorResponse(error: unknown, fallbackMessage = "Terjadi kesalahan server") {
  // Log the full error server-side only
  if (error instanceof Error) {
    console.error(`[SECURITY] ${error.message}`, error.stack);
  } else {
    console.error("[SECURITY] Unknown error:", error);
  }

  // Return generic message to client
  return { error: fallbackMessage };
}
