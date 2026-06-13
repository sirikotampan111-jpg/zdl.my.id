import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
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
  // Content Security Policy — allow Midtrans, Google, and our domain
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "frame-src https://app.sandbox.midtrans.com https://app.midtrans.com",
      "connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://*.googleapis.com",
    ].join("; "),
  },
  // Strict Transport Security (HTTPS only)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,

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
