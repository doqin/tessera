// nextjs-mf bắt buộc dùng webpack cài local thay vì bản webpack đóng gói sẵn trong Next.js.
process.env.NEXT_PRIVATE_LOCAL_WEBPACK = "true";

const NextFederationPlugin = require("@module-federation/nextjs-mf");

// React vendored của Next không có `version` trong package.json → khai báo tường minh để federation
// không cảnh báo. Giữ khớp với `react` ghim ở package.json.
const REACT_VERSION = "18.2.0";

const CHAT_MODULE_URL = process.env.NEXT_PUBLIC_CHAT_MODULE_URL ?? "http://localhost:3001";
const DASHBOARD_MODULE_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_MODULE_URL ?? "http://localhost:3002";

/**
 * Shell (host) — Module Federation trên Next.js 13.5.11 (App Router). Thử lại phương án chính của
 * D2 §3 sau khi lần thử trên Next 15.5 thất bại: xem
 * docs/findings/R2-module-federation-nextjs-approuter.md §13 cho đầy đủ lý do từng workaround.
 *
 * @type {import("next").NextConfig}
 */
const nextConfig = {
  transpilePackages: ["@tessera/shared-ui", "@tessera/integration-store"],
  eslint: {
    // Lint đã chạy như bước CI riêng (`npm run lint` — .github/workflows/ci.yml); tắt lint trong
    // `next build` vì môi trường build của Vercel (Root Directory riêng cho từng app) không luôn
    // cài `eslint` (devDependency ở root, không thuộc closure install của app này).
    ignoreDuringBuilds: true,
  },
  webpack(config, options) {
    if (options.isServer) {
      // Remote chỉ nạp ở client (next/dynamic, ssr: false). Compiler server/edge vẫn parse
      // import() này nên phải cho nó resolve về module rỗng.
      config.resolve.alias = {
        ...config.resolve.alias,
        "chat_module/ChatModule": false,
        "dashboard_module/DashboardModule": false,
      };
      return config;
    }

    // nextjs-mf từ chối App Router (BuildManifestPlugin.appDirEnabled). Tắt cờ này chỉ trong lúc
    // plugin validate; Next vẫn cần cờ này bằng `true` để sinh rootMainFiles → phải đặt lại.
    const manifestPlugin = config.plugins.find(
      (plugin) => plugin?.constructor?.name === "BuildManifestPlugin",
    );
    if (manifestPlugin) manifestPlugin.appDirEnabled = false;

    config.plugins.push(
      new NextFederationPlugin({
        name: "shell",
        filename: "static/chunks/remoteEntry.js",
        remotes: {
          chat_module: `chat_module@${CHAT_MODULE_URL}/_next/static/chunks/remoteEntry.js`,
          dashboard_module: `dashboard_module@${DASHBOARD_MODULE_URL}/_next/static/chunks/remoteEntry.js`,
        },
        // Chia sẻ đúng bản React vendored của Next (không phải React npm) — App Router cần bản
        // này, chia sẻ React npm làm hỏng chính runtime của Next (`use is not a function`).
        shared: {
          react: {
            singleton: true,
            requiredVersion: false,
            import: "next/dist/compiled/react",
            shareKey: "react",
            version: REACT_VERSION,
            eager: true,
          },
          "react/jsx-runtime": {
            singleton: true,
            requiredVersion: false,
            import: "next/dist/compiled/react/jsx-runtime",
            shareKey: "react/jsx-runtime",
            version: REACT_VERSION,
            eager: true,
          },
          "react-dom": {
            singleton: true,
            requiredVersion: false,
            import: "next/dist/compiled/react-dom",
            shareKey: "react-dom",
            version: REACT_VERSION,
            eager: true,
          },
          // Integration Layer: 1 instance store dùng chung giữa Shell và Chat module.
          "@tessera/integration-store": { singleton: true, requiredVersion: false, eager: true },
          zustand: { singleton: true, requiredVersion: false, eager: true },
        },
        // Đè fallback "offline" mặc định của nextjs-mf (render null) bằng lỗi rõ ràng cho boundary.
        runtimePlugins: [require.resolve("./mf/errorRemotePlugin.js")],
        extraOptions: { skipSharingNextInternals: true },
      }),
    );
    config.plugins.push({
      apply(compiler) {
        if (manifestPlugin) manifestPlugin.appDirEnabled = true;
        // nextjs-mf đổi output.publicPath "/_next/" → "auto"; runtime của Next không suy ra được
        // đường dẫn từ script nên URL chunk thành "autostatic/chunks/..." (404). Shell là host tự
        // phục vụ chunk của mình, chunk của remote do remoteEntry của remote tự định vị → đặt lại.
        if (compiler.options.output.publicPath === "auto") {
          compiler.options.output.publicPath = "/_next/";
        }
      },
    });

    return config;
  },
};

module.exports = nextConfig;
