import type { NextConfig } from "next";

/**
 * Zone thứ cấp (Next.js Multi-Zones) — pivot từ Module Federation sau khi xác nhận rủi ro R2 xảy
 * ra thật (xem docs/findings/R2-module-federation-nextjs-approuter.md). `basePath: "/chat"` khiến
 * mọi route + static asset của app này tự động phục vụ dưới tiền tố `/chat`, khớp với rewrite của
 * Shell (specs/001-shell-app/plan.md §2).
 */
const nextConfig: NextConfig = {
  basePath: "/chat",
  transpilePackages: ["@tessera/shared-ui", "@tessera/integration-store"],
  eslint: {
    // Lint đã chạy như bước CI riêng (`npm run lint` — .github/workflows/ci.yml); tắt lint trong
    // `next build` vì môi trường build của Vercel (Root Directory riêng cho từng app) không luôn
    // cài `eslint` (devDependency ở root, không thuộc closure install của app này).
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
