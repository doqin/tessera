import type { NextConfig } from "next";

const CHAT_MODULE_URL = process.env.NEXT_PUBLIC_CHAT_MODULE_URL ?? "http://localhost:3001";

/**
 * Zone chủ (Next.js Multi-Zones) — pivot từ Module Federation sau khi xác nhận rủi ro R2 xảy ra
 * thật (xem docs/findings/R2-module-federation-nextjs-approuter.md). Proxy mọi request `/chat` và
 * `/chat/:path*` (bao gồm cả static asset dưới `/chat/_next/...` do `basePath` của
 * apps/chat-module sinh ra) sang zone Chat module — route-based thay vì runtime import (D3 §5).
 */
const nextConfig: NextConfig = {
  transpilePackages: ["@tessera/shared-ui", "@tessera/integration-store"],
  async rewrites() {
    return [
      { source: "/chat", destination: `${CHAT_MODULE_URL}/chat` },
      { source: "/chat/:path*", destination: `${CHAT_MODULE_URL}/chat/:path*` },
    ];
  },
};

export default nextConfig;
