/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcryptjs', 'sharp', 'exceljs'],
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Each device gets a photo sized for its screen (WebP, quality 90 via components/Img) instead of the
    // 2400 px originals — same clarity, a fraction of the bytes. Resized copies are cached on the server.
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache for images

  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js injects inline bootstrap scripts; dev additionally needs eval + HMR sockets.
              process.env.NODE_ENV === 'production'
                ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.google-analytics.com https://www.googletagmanager.com",
              "media-src 'self'",
              process.env.NODE_ENV === 'production'
                ? "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com"
                : "connect-src 'self' ws: wss: https://www.google-analytics.com",
              "frame-src https://www.instagram.com https://www.google.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self' https://wa.me",
              "object-src 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/book-now', destination: '/book', permanent: true },
      { source: '/book-now/:branch', destination: '/book?branch=:branch', permanent: true },
      { source: '/book-now-electronic-city', destination: '/book?branch=electronic-city', permanent: true },
      { source: '/book-now-btm-stage-2', destination: '/book?branch=btm-stage-2', permanent: true },
      { source: '/booking-success/:ref', destination: '/ticket/:ref', permanent: true },
      { source: '/venues/:slug', destination: '/#theatres', permanent: true },
      { source: '/:page(about|contact|faq|testimonials|blog|account|login)', destination: '/', permanent: true },
      { source: '/blog/:slug', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
