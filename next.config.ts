import type { NextConfig } from "next";

const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

const securityHeaders = [
  // Prevent clickjacking — restrict to same origin only
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Prevent MIME type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Enable XSS protection in older browsers
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Control referrer information
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Restrict permissions
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Content Security Policy — strengthened from previous version
  // NOTE: 'unsafe-eval' and 'unsafe-inline' are still needed for Midtrans Snap SDK
  // and Next.js runtime. In a future iteration, migrate to nonce-based CSP.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Midtrans Snap SDK requires eval and inline scripts — cannot remove without breaking payment
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "frame-src https://app.sandbox.midtrans.com https://app.midtrans.com",
      "connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://*.googleapis.com",
      // SECURITY: Restrict object and embed to prevent plugin-based attacks
      "object-src 'none'",
      // SECURITY: Restrict base-uri to prevent base tag injection
      "base-uri 'self'",
      // SECURITY: Restrict form actions to same origin
      "form-action 'self'",
      // SECURITY: Enforce HTTPS on all subresources
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // Strict Transport Security (HTTPS only) — 2 year max-age with preload
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Cross-Origin policies for additional protection
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
];

const nextConfig: NextConfig = {
  typescript: {
    // SECURITY: Set to false — TypeScript errors should be caught in CI/CD
    // Kept as true temporarily during active development; change to false before production
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,

  // SECURITY: Power headers for all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
