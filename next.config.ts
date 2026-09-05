import type { NextConfig } from "next";

/**
 * Origem do backend FastAPI (usada pelo servidor Next + proxy).
 * O navegador nunca chama a API directamente: usa o prefixo relativo
 * NEXT_PUBLIC_API_PREFIX, que o Next reescreve para API_ORIGIN.
 * Assim não é preciso CORS nem expor a porta do backend ao utilizador.
 */
const API_ORIGIN = process.env.API_ORIGIN || "http://localhost:8000";

const apiOriginUrl = new URL(API_ORIGIN);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  images: {
    // URLs de imagens devolvidas pela API podem apontar para qualquer host
    // (uploads no próprio backend, unsplash, etc.). São resolvidas de forma
    // centralizada em lib/api/assets.ts.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: apiOriginUrl.hostname },
    ],
    localPatterns: [{ pathname: "/backend/**" }],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
