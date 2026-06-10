---
Task ID: 1
Agent: Main Agent
Task: Complete ZDL Vercel deployment audit + SEO setup for zdl.my.id

Work Log:
- Verified login/page.tsx — no more useEffect bug (already clean)
- Removed `output: "standalone"` from next.config.ts (required for Vercel)
- Updated build script: removed standalone copy commands, simplified to `next build`
- Updated start script: `next start` instead of standalone server
- Created src/app/sitemap.ts (dynamic sitemap for zdl.my.id)
- Created src/app/robots.ts (dynamic robots.txt with sitemap reference, disallow /api/ and /dashboard/)
- Removed static public/robots.txt (replaced by dynamic robots.ts)
- Updated layout.tsx metadata:
  - Domain zdl.web.id → zdl.my.id everywhere
  - Added metadataBase, title template, robots directives, canonical URL
  - Added Google Search Console verification support (NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION env var)
  - Made Midtrans Snap script environment-aware (sandbox vs production based on NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION)
- Fixed CRITICAL bug: webhook/midtrans/route.ts `orderId: order.orderId` → `orderId: order.id` (FK constraint)
- Fixed MIDTRANS_IS_PRODUCTION env var consistency → unified to NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION
- Fixed hardcoded fallback secret in middleware.ts (removed "zdl-secret-key-change-in-production")
- Fixed zdl.web.id → zdl.my.id in: midtrans/route.ts, chat/route.ts, footer.tsx
- Fixed footer.tsx copyright year to dynamic new Date().getFullYear()
- Removed 35 unused npm packages (from 67 to 32 deps) - significant build size reduction
- Created .env.example with complete documentation for all env vars
- Ran `bun install` to clean node_modules
- Ran `next build` — SUCCESS with zero errors

Stage Summary:
- All files verified for Vercel deployment
- SEO: sitemap.xml + robots.txt ready for Google Search Console
- Domain consistently zdl.my.id throughout codebase
- 35 unused packages removed (faster builds, smaller serverless functions)
- Zero build errors
