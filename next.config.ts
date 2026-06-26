import type { NextConfig } from "next";

// Next.js сам не использует script-src 'nonce' в этом проекте (страницы
// в основном статически рендерятся), поэтому строгий nonce-based CSP
// потребовал бы перевода всех страниц на dynamic rendering — это отдельная
// большая переделка. Здесь — практичный набор заголовков без таких рисков:
// блокирует загрузку чужих скриптов/стилей/коннектов и кликджекинг,
// при этом не ломает уже работающий рендеринг.
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
