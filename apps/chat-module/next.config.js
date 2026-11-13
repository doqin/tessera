// nextjs-mf bắt buộc dùng webpack cài local thay vì bản webpack đóng gói sẵn trong Next.js.
process.env.NEXT_PRIVATE_LOCAL_WEBPACK = "true";

const NextFederationPlugin = require("@module-federation/nextjs-mf");

// React vendored của Next không có `version` trong package.json → khai báo tường minh để federation
// không cảnh báo. Giữ khớp với `react` ghim ở package.json.
const REACT_VERSION = "18.2.0";

/**
 * Chat module (remote) — expose `./ChatModule` qua Module Federation trên Next.js 13.5.11 (App
 * Router). Vẫn chạy độc lập được ở :3001 (dev/test riêng). Giải thích các workaround:
 * docs/findings/R2-module-federation-nextjs-approuter.md §13.
 *
 * @type {import("next").NextConfig}
 */
const nextConfig = {
  transpilePackages: ["@tessera/shared-ui", "@tessera/integration-store"],
  eslint: {
    // Xem ghi chú tương tự ở apps/shell/next.config.js.
    ignoreDuringBuilds: true,
  },
  async headers() {
    // remoteEntry.js không có content hash nhưng Next mặc định gắn `immutable` cho /_next/static →
    // trình duyệt giữ bản cũ (trỏ tới chunk đã bị xoá sau deploy). Buộc revalidate mỗi lần: 304
    // rẻ hơn nhiều so với tải lại ~400 KB, các chunk có hash vẫn cache immutable.
    return [
      {
        source: "/_next/static/chunks/remoteEntry.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
  webpack(config, options) {
    // Chỉ federation ở client: component được expose là client component, Shell nạp với ssr: false.
    if (options.isServer) return config;

    // Xem ghi chú ở apps/shell/next.config.js về cờ appDirEnabled.
    const manifestPlugin = config.plugins.find(
      (plugin) => plugin?.constructor?.name === "BuildManifestPlugin",
    );
    if (manifestPlugin) manifestPlugin.appDirEnabled = false;

    config.plugins.push(
      new NextFederationPlugin({
        name: "chat_module",
        filename: "static/chunks/remoteEntry.js",
        exposes: { "./ChatModule": "./components/ChatModule.tsx" },
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
          "@tessera/integration-store": { singleton: true, requiredVersion: false, eager: true },
          zustand: { singleton: true, requiredVersion: false, eager: true },
        },
        extraOptions: { skipSharingNextInternals: true },
      }),
    );
    config.plugins.push({
      apply() {
        if (manifestPlugin) manifestPlugin.appDirEnabled = true;
      },
    });

    return config;
  },
};

module.exports = nextConfig;
