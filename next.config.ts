import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TODO: Remove once shadcn/ui type mismatches are resolved
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // Restrict img-src to specific domains (not broad https:)
              "img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://ui-avatars.com https://res.cloudinary.com",
              "connect-src 'self' https://api.midtrans.com https://app.sandbox.midtrans.com https://app.midtrans.com",
              // frame-src: Google Maps embed + Midtrans Snap
              "frame-src https://www.google.com https://maps.google.com https://app.sandbox.midtrans.com https://app.midtrans.com",
              // frame-ancestors: only same origin can embed
              "frame-ancestors 'self'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
