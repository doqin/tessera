#!/usr/bin/env node
/**
 * Trial LLM API connection (UIT.SE.66-D1 §6, checklist item 5).
 *
 * Provider mặc định: Groq (free tier, API tương thích OpenAI /chat/completions) — tránh phát
 * sinh chi phí cho PoC. OpenAI/Claude vẫn được hỗ trợ như phương án production-target (xem
 * .specify/constitution.md §5), dùng khi cần model chất lượng cao hơn và chấp nhận chi phí.
 *
 * An toàn chi phí: script CHỈ đọc key từ tools/llm-trial/.env.local của chính project này —
 * không bao giờ đọc process.env kế thừa từ shell (tránh vô tình dùng key trả phí có sẵn trên
 * máy cho mục đích khác). Gọi Anthropic/OpenAI (trả phí) còn cần thêm cờ --allow-paid, để không
 * bao giờ âm thầm tốn tiền chỉ vì .env.local lỡ có key trả phí.
 *
 * Chỉ dùng dữ liệu mẫu/dummy — đúng cam kết bảo mật (NDA) trong Project Charter. Không import
 * package nào ngoài Tech Stack đã chốt: dùng `fetch` sẵn có trong Node.js, không thêm SDK riêng
 * của từng provider (Groq/OpenAI đều expose cùng REST shape /chat/completions).
 *
 * Cách chạy:
 *   1. cp tools/llm-trial/.env.local.example tools/llm-trial/.env.local
 *   2. Điền GROQ_API_KEY (free — https://console.groq.com/keys) vào .env.local
 *   3. node tools/llm-trial/test-llm-connection.mjs
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env.local");

/** Parse tối giản .env.local — không đụng tới process.env kế thừa từ shell. */
function readProjectEnvFile(filePath) {
  const values = {};
  if (!existsSync(filePath)) return values;

  for (const rawLine of readFileSync(filePath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value) values[key] = value;
  }
  return values;
}

const projectEnv = readProjectEnvFile(envPath);
const allowPaid = process.argv.includes("--allow-paid");

const MOCK_PROMPT =
  "Đây là dữ liệu mẫu (mock/dummy) cho mục đích kiểm thử kết nối kỹ thuật, không phải dữ liệu " +
  "thật. Hãy trả lời ngắn gọn bằng một câu xác nhận rằng bạn đã nhận được tin nhắn này.";

/** Groq và OpenAI cùng dùng REST shape /chat/completions — dùng chung 1 hàm gọi. */
async function callOpenAiCompatible({ label, baseUrl, apiKey, model }) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: MOCK_PROMPT }],
      max_tokens: 200,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`${label} API lỗi (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.choices?.[0]?.message?.content ?? JSON.stringify(body);
}

async function callAnthropic(apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 200,
      messages: [{ role: "user", content: MOCK_PROMPT }],
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Anthropic API lỗi (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.content?.[0]?.text ?? JSON.stringify(body);
}

const PROVIDERS = [
  {
    envKey: "GROQ_API_KEY",
    label: "Groq (free tier)",
    paid: false,
    call: (apiKey) =>
      callOpenAiCompatible({
        label: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
        apiKey,
        model: "qwen/qwen3.8-27b",
      }),
  },
  {
    envKey: "ANTHROPIC_API_KEY",
    label: "Claude (Anthropic — trả phí, production-target)",
    paid: true,
    call: callAnthropic,
  },
  {
    envKey: "OPENAI_API_KEY",
    label: "OpenAI (trả phí, production-target)",
    paid: true,
    call: (apiKey) =>
      callOpenAiCompatible({
        label: "OpenAI",
        baseUrl: "https://api.openai.com/v1",
        apiKey,
        model: "gpt-4o-mini",
      }),
  },
];

async function main() {
  const candidates = PROVIDERS.filter((p) => projectEnv[p.envKey]);
  const free = candidates.find((p) => !p.paid);
  const paid = candidates.find((p) => p.paid);

  if (!free && !paid) {
    console.error(
      `Chưa có API key trong ${envPath}.\n` +
        "Copy tools/llm-trial/.env.local.example thành .env.local và điền GROQ_API_KEY " +
        "(miễn phí, khuyến nghị cho PoC) trước khi chạy lại script này.\n" +
        "(Script chỉ đọc .env.local của project, không dùng API key có sẵn trong shell.)",
    );
    process.exitCode = 1;
    return;
  }

  if (!free && paid && !allowPaid) {
    console.error(
      `Chỉ tìm thấy key trả phí (${paid.label}) trong .env.local, không có GROQ_API_KEY.\n` +
        "Script từ chối gọi provider trả phí để tránh vô tình tốn tiền. Thêm GROQ_API_KEY " +
        "(miễn phí) để test bình thường, hoặc chạy lại với cờ --allow-paid nếu bạn CHỦ ĐỘNG " +
        "muốn test provider trả phí.",
    );
    process.exitCode = 1;
    return;
  }

  const provider = free ?? paid;
  console.log(`Đang gọi thử ${provider.label} bằng dữ liệu mẫu...`);

  try {
    const text = await provider.call(projectEnv[provider.envKey]);
    console.log(`\n[${provider.label}] Kết nối thành công. Phản hồi:\n${text}\n`);
  } catch (err) {
    console.error(
      `\nKết nối ${provider.label} thất bại:`,
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  }
}

await main();
