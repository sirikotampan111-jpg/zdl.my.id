---
Task ID: 1
Agent: Main Agent
Task: Fix Google OAuth redirect_uri_mismatch + super-admin access + registration

Work Log:
- Discovered root cause: Vercel redirects zdl.my.id → www.zdl.my.id (307), causing NextAuth to send redirect URI as https://www.zdl.my.id/api/auth/callback/google but Google Cloud Console only had https://zdl.my.id/api/auth/callback/google
- Fixed NEXTAUTH_URL normalization in auth.ts to default to https://www.zdl.my.id
- Added override logic when NEXTAUTH_URL is set to non-www or vercel.app domain
- Fixed CSP form-action to include https://accounts.google.com for OAuth flow
- Created /api/admin/force-upgrade endpoint (auth via NEXTAUTH_SECRET) for manual super-admin promotion
- Created /api/auth/debug diagnostic endpoint showing OAuth config without exposing secrets
- Added method rules in proxy.ts for /api/auth/register, /api/auth/debug, /api/admin/force-upgrade
- Enhanced super-admin auto-upgrade: now checks on EVERY JWT callback, not just on sign-in
- Seeded super-admin user via /api/admin/setup GET endpoint (sirikotampan111@gmail.com, password: zdl123)
- Verified: registration works, credentials login works, super-admin role works

Stage Summary:
- Root cause of redirect_uri_mismatch: www vs non-www domain mismatch
- All runtime features verified working: registration ✅, login ✅, super-admin ✅
- Google OAuth requires user to add https://www.zdl.my.id/api/auth/callback/google to Google Cloud Console
- Deployed commit: fix: NEXTAUTH_URL must use www.zdl.my.id (Vercel 307 redirect)
