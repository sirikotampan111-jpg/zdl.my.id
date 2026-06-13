import { z } from "zod";

// ========== Sanitization ==========

/** Strip HTML tags and trim whitespace */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>\"'&]/g, (c) => {
      const map: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return map[c] || c;
    })
    .trim();
}

/** Sanitize string but allow basic formatting (for notes) */
export function sanitizeRichText(input: string): string {
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // strip script tags
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "") // strip iframe tags
    .replace(/on\w+\s*=/gi, "") // strip event handlers
    .replace(/javascript:/gi, "") // strip javascript: protocol
    .trim();
}

// ========== Auth / RBAC ==========

export const VALID_ROLES = ["customer", "admin", "super-admin"] as const;
export type Role = (typeof VALID_ROLES)[number];

export const VALID_ORDER_STATUSES = [
  "pending",
  "paid",
  "failed",
  "expired",
  "refunded",
] as const;

export const VALID_PROJECT_STATUSES = [
  "planning",
  "design",
  "development",
  "testing",
  "online",
] as const;

export const VALID_MILESTONE_STATUSES = [
  "pending",
  "in_progress",
  "completed",
] as const;

export const VALID_PAYMENT_METHODS = [
  "qris",
  "bank",
  "ewallet",
  "cc",
] as const;

export const VALID_PAYMENT_OPTIONS = ["dp", "full"] as const;

export const VALID_CATEGORIES = [
  "html",
  "nextjs",
  "admin",
  "tambahan",
  "custom",
] as const;

// ========== Zod Schemas ==========

export const checkoutSchema = z
  .object({
    // Single item (legacy)
    packageName: z.string().min(1).max(200).optional(),
    packagePrice: z.number().positive().max(100_000_000).optional(),
    packageCategory: z.enum(VALID_CATEGORIES).optional(),

    // Multi item (cart)
    items: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          name: z.string().min(1).max(200),
          price: z.number().positive().max(100_000_000),
          category: z.enum(VALID_CATEGORIES),
          quantity: z.number().int().min(1).max(10),
        })
      )
      .max(10)
      .optional(),

    // Common
    customerName: z.string().min(1).max(200).transform(sanitizeString),
    customerEmail: z.string().email().max(200),
    customerPhone: z
      .string()
      .min(8)
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, "Nomor telepon tidak valid"),
    businessName: z.string().max(200).transform(sanitizeString).optional(),
    notes: z.string().max(2000).transform(sanitizeRichText).optional(),
    paymentMethod: z.enum(VALID_PAYMENT_METHODS).optional(),
    paymentOption: z.enum(VALID_PAYMENT_OPTIONS).optional(),
    userId: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.items && data.items.length > 0) ||
      (data.packageName && data.packagePrice),
    {
      message: "Either items or packageName/packagePrice must be provided",
    }
  );

export const registerSchema = z.object({
  name: z.string().min(1).max(200).transform(sanitizeString),
  email: z.string().email().max(200),
  password: z.string().min(6).max(100),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, "Nomor telepon tidak valid")
    .optional(),
  businessName: z.string().max(200).transform(sanitizeString).optional(),
});

export const setupSchema = z.object({
  name: z.string().min(1).max(200).transform(sanitizeString),
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
});

export const orderCreateSchema = z.object({
  packageName: z.string().min(1).max(200).transform(sanitizeString),
  packageCategory: z.enum(VALID_CATEGORIES),
  packagePrice: z.number().positive().max(100_000_000),
  ppnAmount: z.number().nonnegative().max(50_000_000).optional(),
  transactionFee: z.number().nonnegative().max(100_000).optional(),
  payAmount: z.number().positive().max(150_000_000).optional(),
  dpMinimal: z.number().nonnegative().max(50_000_000).optional(),
  isDP: z.boolean().optional(),
  customerName: z.string().min(1).max(200).transform(sanitizeString).optional(),
  customerEmail: z.string().email().max(200).optional(),
  customerPhone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/)
    .optional(),
  businessName: z.string().max(200).transform(sanitizeString).optional(),
  notes: z.string().max(2000).transform(sanitizeRichText).optional(),
});

export const adminUpdateOrderSchema = z.object({
  id: z.string().min(1).max(100),
  status: z.enum(VALID_ORDER_STATUSES),
});

export const adminUpdateProjectSchema = z.object({
  id: z.string().min(1).max(100),
  addMilestone: z.boolean().optional(),
  milestoneTitle: z.string().min(1).max(200).transform(sanitizeString).optional(),
  projectName: z.string().min(1).max(200).transform(sanitizeString).optional(),
  status: z.enum(VALID_PROJECT_STATUSES).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(2000).transform(sanitizeRichText).optional(),
  liveUrl: z.string().url().max(500).optional(),
  estimatedDone: z.string().optional(),
});

export const adminUpdateUserSchema = z.object({
  id: z.string().min(1).max(100),
  role: z.enum(VALID_ROLES),
});

export const adminDeleteSchema = z.object({
  id: z.string().min(1).max(100),
});

export const cartActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    item: z.object({
      id: z.string().min(1).max(100),
      name: z.string().min(1).max(200),
      price: z.number().positive().max(100_000_000),
      category: z.enum(VALID_CATEGORIES),
    }),
  }),
  z.object({
    action: z.literal("remove"),
    item: z.object({ id: z.string().min(1).max(100) }),
  }),
  z.object({
    action: z.literal("update"),
    item: z.object({
      id: z.string().min(1).max(100),
      quantity: z.number().int().min(0).max(10),
    }),
  }),
  z.object({
    action: z.literal("sync"),
    items: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          name: z.string().min(1).max(200),
          price: z.number().positive().max(100_000_000),
          category: z.enum(VALID_CATEGORIES),
          quantity: z.number().int().min(1).max(10),
        })
      )
      .max(10),
  }),
  z.object({
    action: z.literal("clear"),
  }),
]);

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000).transform(sanitizeString),
      })
    )
    .min(1)
    .max(50),
  sessionId: z.string().max(100).optional(),
});

export const midtransWebhookSchema = z.object({
  order_id: z.string().min(1).max(100),
  transaction_id: z.string().max(100).optional(),
  transaction_status: z.enum([
    "capture",
    "settlement",
    "pending",
    "deny",
    "expire",
    "cancel",
    "refund",
    "partial_refund",
  ]),
  transaction_time: z.string().max(50).optional(),
  payment_type: z.string().max(50).optional(),
  gross_amount: z.string().max(20).optional(),
  currency: z.string().max(10).optional(),
  fraud_status: z.enum(["accept", "challenge", "deny"]).optional(),
  signature_key: z.string().max(200).optional(),
  status_code: z.string().max(10).optional(),
});
