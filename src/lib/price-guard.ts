/**
 * Server-Side Price Validation
 *
 * CRITICAL SECURITY: Never trust client-supplied prices.
 * All prices MUST be resolved from the authoritative server-side catalog.
 * This prevents price manipulation attacks where a malicious client
 * submits arbitrary prices to the checkout/payment API.
 */

import { allServices, type ServiceItem } from "@/lib/data";

// Build a lookup map from the authoritative catalog for O(1) access
const serviceMap = new Map<string, ServiceItem>();
for (const service of allServices) {
  serviceMap.set(service.id, service);
}

export interface ValidatedCartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

/**
 * Validate a single item against the server-side catalog.
 * Returns the authoritative item data or null if the item ID is not found.
 */
export function validateServiceItem(
  itemId: string,
  clientPrice?: number,
  clientName?: string,
  clientCategory?: string
): { valid: true; item: ServiceItem } | { valid: false; error: string } {
  const service = serviceMap.get(itemId);

  if (!service) {
    return {
      valid: false,
      error: `Layanan dengan ID "${itemId}" tidak ditemukan dalam katalog`,
    };
  }

  // Warn if client supplied mismatched data (but we always use server data)
  if (clientPrice !== undefined && clientPrice !== service.price) {
    console.warn(
      `[SECURITY] Price mismatch for item "${itemId}": client=${clientPrice}, server=${service.price}. Using server price.`
    );
  }
  if (clientName !== undefined && clientName !== service.name) {
    console.warn(
      `[SECURITY] Name mismatch for item "${itemId}": client="${clientName}", server="${service.name}". Using server name.`
    );
  }
  if (clientCategory !== undefined && clientCategory !== service.category) {
    console.warn(
      `[SECURITY] Category mismatch for item "${itemId}": client="${clientCategory}", server="${service.category}". Using server category.`
    );
  }

  return { valid: true, item: service };
}

/**
 * Validate an array of cart items against the server-side catalog.
 * Returns validated items with server-authoritative prices.
 * Rejects the entire batch if any item is invalid.
 */
export function validateCartItems(
  items: Array<{ id: string; name?: string; price?: number; category?: string; quantity: number }>
): { valid: true; items: ValidatedCartItem[] } | { valid: false; error: string } {
  const validated: ValidatedCartItem[] = [];

  for (const input of items) {
    const result = validateServiceItem(input.id, input.price, input.name, input.category);
    if (!result.valid) {
      return { valid: false, error: result.error };
    }

    validated.push({
      id: result.item.id,
      name: result.item.name,
      price: result.item.price,
      category: result.item.category,
      quantity: input.quantity,
    });
  }

  return { valid: true, items: validated };
}

/**
 * Validate a single package checkout (non-cart mode).
 * Returns authoritative package data from the catalog.
 */
export function validatePackageCheckout(
  packageId: string,
  clientPrice?: number
): { valid: true; item: ServiceItem } | { valid: false; error: string } {
  return validateServiceItem(packageId, clientPrice);
}

/**
 * Check if a category is DP-eligible (html or nextjs packages)
 */
export function isDPEligibleCategory(category: string): boolean {
  return category === "html" || category === "nextjs";
}

/**
 * Calculate total price from validated cart items
 */
export function calculateCartTotal(items: ValidatedCartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
