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

---
Task ID: 2
Agent: Main Agent
Task: Fix Internal Server Error on checkout - root cause analysis and fix

Work Log:
- Tested API directly - single item mode and cart mode both work locally
- Discovered MIDTRANS_SERVER_KEY is empty in .env → demo mode → works locally
- User has Midtrans sandbox dashboard → likely MIDTRANS_SERVER_KEY is set in Vercel production
- Found critical bug: Midtrans API error was returned as 500 instead of 400
- Found critical bug: item_details rounding fix was applied BEFORE PPN/fee items were added
  - This caused sum(price*qty) != gross_amount → Midtrans rejects transaction
- Fixed: Midtrans API errors now return 400 with actual error message
- Fixed: Rounding adjustment now applied AFTER all items (including PPN/fee) are added
- Fixed: catch-all error handler now returns actual error message for debugging
- Verified pricing math: all test cases produce exact gross_amount match

Stage Summary:
- Root cause: item_details total didn't match gross_amount due to rounding fix timing
- Midtrans API rejection was masked as 500 Internal Server Error
- All pricing calculations verified correct
- Build succeeds

---
Task ID: 3
Agent: Main Agent
Task: Fix Internal Server Error on checkout (FOREIGN KEY constraint failed)

Work Log:
- Tested midtrans API endpoint locally and reproduced the error
- Root cause: SQLITE_CONSTRAINT FOREIGN KEY constraint failed on db.order.create()
- The midtrans route used userId from frontend/session without verifying it exists in DB
- When user logs in via Google OAuth, session userId may not match any row in User table
- Fixed: Rewrote userId resolution logic with 4-step verification:
  1. Try session userId → verify against DB
  2. Try frontend-provided userId → verify against DB
  3. Try to find user by customerEmail
  4. Last resort: create new guest user
- Also improved error handling: FK constraint errors now return 400 with user-friendly message instead of 500
- Tested both non-existent and valid userId scenarios — both pass

Stage Summary:
- Root cause: userId from session not verified against DB before creating Order (FK violation)
- Fix: Always verify userId exists in DB, fallback to email lookup then create new user
- FK constraint errors now return 400 instead of 500 with clear message
- Build succeeds, both test cases pass
