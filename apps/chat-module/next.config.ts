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
};

export default nextConfig;
