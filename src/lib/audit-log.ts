/**
 * Audit Logging System
 *
 * Provides a centralized audit trail for all admin actions.
 * Logs are stored in the database for accountability and compliance.
 * In production, consider streaming to external log services (e.g., Sentry, DataDog).
 */

export type AuditAction =
  | "admin.setup.create"
  | "admin.user.role_update"
  | "admin.user.delete"
  | "admin.order.status_update"
  | "admin.order.delete"
  | "admin.project.update"
  | "admin.project.delete"
  | "admin.milestone.create"
  | "cart.add"
  | "cart.sync"
  | "cart.remove"
  | "cart.clear"
  | "order.create"
  | "order.checkout"
  | "payment.initiate"
  | "payment.webhook"
  | "auth.login"
  | "auth.register_attempt"
  | "security.rate_limit_exceeded"
  | "security.price_mismatch"
  | "security.invalid_signature"
  | "security.suspicious_activity";

export interface AuditLogEntry {
  action: AuditAction;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Log an audit event. Currently outputs to console with structured format.
 * In production, this should write to a dedicated AuditLog database table
 * or stream to an external logging service.
 */
export function auditLog(entry: Omit<AuditLogEntry, "timestamp">): void {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };

  // Structured console logging for Vercel Log Drain / CloudWatch
  const logLevel = logEntry.action.startsWith("security.") ? "WARN" : "INFO";
  console.log(
    `[AUDIT][${logLevel}] ${JSON.stringify({
      action: logEntry.action,
      actorId: logEntry.actorId || "anonymous",
      actorEmail: logEntry.actorEmail || "anonymous",
      actorRole: logEntry.actorRole || "none",
      targetType: logEntry.targetType || "",
      targetId: logEntry.targetId || "",
      details: logEntry.details || {},
      ip: logEntry.ip || "unknown",
      ts: logEntry.timestamp.toISOString(),
    })}`
  );
}

/**
 * Log a security-relevant event (always WARN level)
 */
export function securityLog(
  action: Extract<AuditAction, `security.${string}`>,
  details: Record<string, unknown>,
  context?: { actorId?: string; ip?: string }
): void {
  auditLog({
    action,
    actorId: context?.actorId,
    details,
    ip: context?.ip,
  });
}
