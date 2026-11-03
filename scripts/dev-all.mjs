#!/usr/bin/env node
/**
 * Chạy toàn bộ service cục bộ: Shell (:3000), Chat module (:3001), Dashboard module (:3002).
 * Không cần dependency ngoài. Ctrl+C dừng tất cả. Dùng: `npm run dev:all`.
 *
 * Tuỳ chọn: `--only=shell,chat` để chạy một phần.
 */
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { setTimeout } from "node:timers";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";

const SERVICES = [
  { key: "chat", workspace: "apps/chat-module", port: 3001, color: "\x1b[36m" },
  { key: "dashboard", workspace: "apps/dashboard-module", port: 3002, color: "\x1b[35m" },
  { key: "shell", workspace: "apps/shell", port: 3000, color: "\x1b[32m" },
];
const RESET = "\x1b[0m";

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",") : null;
const selected = SERVICES.filter((s) => !only || only.includes(s.key));
if (selected.length === 0) {
  console.error(`--only không khớp service nào. Hợp lệ: ${SERVICES.map((s) => s.key).join(", ")}`);
  process.exit(1);
}

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
if (spawnSync(process.execPath, [nextBin, "--version"], { cwd: root }).status !== 0) {
  console.error("Chưa cài dependency. Chạy `npm install` ở thư mục gốc trước.");
  process.exit(1);
}

const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    // Windows: kill cả cây tiến trình (next dev sinh worker con).
    if (isWin) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
    else child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 500);
}

function prefixLines(service, stream, target) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) target.write(`${service.color}[${service.key}]${RESET} ${line}\n`);
  });
}

for (const service of selected) {
  const child = spawn(process.execPath, [nextBin, "dev", "-p", String(service.port)], {
    cwd: path.join(root, service.workspace),
    env: { ...process.env, FORCE_COLOR: "0", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.push(child);
  prefixLines(service, child.stdout, process.stdout);
  prefixLines(service, child.stderr, process.stderr);
  child.on("exit", (code) => {
    if (shuttingDown) return;
    console.error(`[${service.key}] thoát với mã ${code} — dừng các service còn lại.`);
    shutdown(code ?? 1);
  });
}

console.log(
  `Đang chạy: ${selected.map((s) => `${s.key} → http://localhost:${s.port}`).join(" | ")}\n` +
    "Mở http://localhost:3000 (Shell). Ctrl+C để dừng.",
);

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
