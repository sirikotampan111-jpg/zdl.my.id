---
Task ID: 1
Agent: Main Agent
Task: Fix checkout flow bugs - DP calculation, Project unique constraint, Cart models, TypeScript errors

Work Log:
- Identified DP calculation mismatch: frontend CheckoutModal used DP_RATE (50%) while backend used DP_MINIMAL (Rp500.000)
- Fixed calculatePriceBreakdown() in lib/data.ts to use DP_MINIMAL consistently
- Extended PriceBreakdown interface with fullTotal, fullPPN, dpPPN, dpTotal, sisaTotal
- Fixed Project unique constraint violation: changed from creating multiple projects per cart item to single combined project
- Added Cart and CartItem models to Prisma schema
- Fixed cart/route.ts validateBodySize() call (was passing string instead of Request)
- Fixed webhook/midtrans/route.ts type errors (added MidtransWebhookBody interface)
- Fixed price-calculator.tsx to use new PriceBreakdown properties
- Regenerated Prisma client and pushed schema to SQLite DB
- Verified Next.js build succeeds with no errors

Stage Summary:
- All checkout-related TypeScript errors resolved
- DP calculation now consistent: DP_MINIMAL (Rp500.000) across frontend and backend
- Cart API now has proper Prisma models (Cart, CartItem)
- Project creation now handles multi-item carts without unique constraint violation
- Build passes successfully
