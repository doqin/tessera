import { defineConfig, devices } from "@playwright/test";

/**
 * E2E Shell ⇄ remote (specs/001-shell-app/tasks.md T016). Chạy trên bản production build của 3
 * app (`npm run build --workspaces --if-present` trước) — cùng cách Shell nạp remote khi deploy.
 */
const apps: { workspace: string; port: number; path?: string }[] = [
  { workspace: "apps/chat-module", port: 3001 },
  { workspace: "apps/dashboard-module", port: 3002, path: "/dashboard" },
  { workspace: "apps/shell", port: 3000, path: "/chat" },
];

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  // channel "chromium": Chromium đầy đủ (new headless), không cần tải thêm headless-shell.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chromium" } }],
  webServer: apps.map(({ workspace, port, path = "/" }) => ({
    command: `npx next start -p ${port}`,
    cwd: workspace,
    url: `http://localhost:${port}${path}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  })),
});
