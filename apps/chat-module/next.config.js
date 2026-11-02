// nextjs-mf bắt buộc dùng webpack cài local thay vì bản webpack đóng gói sẵn trong Next.js.
process.env.NEXT_PRIVATE_LOCAL_WEBPACK = "true";

const NextFederationPlugin = require("@module-federation/nextjs-mf");

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
            eager: true,
          },
          "react/jsx-runtime": {
            singleton: true,
            requiredVersion: false,
            import: "next/dist/compiled/react/jsx-runtime",
            shareKey: "react/jsx-runtime",
            eager: true,
          },
          "react-dom": {
            singleton: true,
            requiredVersion: false,
            import: "next/dist/compiled/react-dom",
            shareKey: "react-dom",
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
