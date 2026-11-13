/**
 * Logic của route handler `/api/chat` (specs/002-chat-module/tasks.md T012/T013): proxy tới Groq
 * `/chat/completions` với `stream: true`, giữ `GROQ_API_KEY` ở phía server (code của remote chạy
 * trong trình duyệt của Shell nên không được chứa key). Tách khỏi `route.ts` để unit test được.
 */
import { TOOL_DEFINITIONS } from "./tools";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Cùng model với tools/llm-trial/test-llm-connection.mjs; đổi bằng GROQ_MODEL.
const DEFAULT_MODEL = "qwen/qwen3.8-27b";
export const MAX_PROMPT_LENGTH = 4000;

function corsHeaders(): Record<string, string> {
  return {
    // Shell (origin khác) gọi API này cross-origin. Giới hạn origin bằng CHAT_ALLOWED_ORIGIN.
    "Access-Control-Allow-Origin": process.env.CHAT_ALLOWED_ORIGIN ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}

function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders(), "content-type": "application/json" },
  });
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function handleChatRequest(request: Request): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return jsonError(500, "Server chưa cấu hình GROQ_API_KEY.");

  let prompt: unknown;
  try {
    ({ prompt } = (await request.json()) as { prompt?: unknown });
  } catch {
    return jsonError(400, "Body phải là JSON.");
  }
  if (typeof prompt !== "string" || !prompt.trim()) {
    return jsonError(400, "Thiếu prompt.");
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return jsonError(400, `Prompt vượt quá ${MAX_PROMPT_LENGTH} ký tự.`);
  }

  let upstream: Response;
  try {
    upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? DEFAULT_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        tools: TOOL_DEFINITIONS,
        tool_choice: "auto",
      }),
      signal: request.signal,
    });
  } catch {
    return jsonError(502, "Không kết nối được Groq API.");
  }

  if (!upstream.ok || !upstream.body) {
    // Không chuyển tiếp body lỗi của Groq (có thể chứa thông tin nhạy cảm).
    return jsonError(502, `Groq API lỗi (${upstream.status}).`);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...corsHeaders(),
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
