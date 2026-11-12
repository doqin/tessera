/**
 * Logic của route handler `/api/chat` (specs/002-chat-module/tasks.md T012/T013): proxy tới Groq
 * `/chat/completions` với `stream: true`, giữ `GROQ_API_KEY` ở phía server (code của remote chạy
 * trong trình duyệt của Shell nên không được chứa key). Tách khỏi `route.ts` để unit test được.
 */

import { DEMO_TOOLS, runDemoTool } from "./demoTools";

/** Dòng SSE tuỳ biến do route chèn thêm: tool call đã thực thi (kèm kết quả mẫu). */
export const TOOL_EVENT_KEY = "tessera_tool_call";

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

interface PendingToolCall {
  id: string;
  name: string;
  args: string;
}

function parseArgs(raw: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(raw || "{}");
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/**
 * Chuyển tiếp nguyên SSE của Groq, đồng thời gom các `delta.tool_calls`. Khi upstream kết thúc
 * bằng `[DONE]`, chạy tool mẫu và chèn sự kiện `tessera_tool_call` TRƯỚC `[DONE]` (dòng `[DONE]`
 * bị giữ lại đến lúc đó). Stream bị cắt (không có `[DONE]`) thì không chèn gì — client coi là ngắt.
 */
export function withToolExecution(source: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const pending = new Map<number, PendingToolCall>();
  let buffer = "";
  let sawDone = false;

  const handleLine = (line: string, controller: TransformStreamDefaultController<Uint8Array>) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("data:")) {
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") {
        sawDone = true;
        return;
      }
      try {
        const json = JSON.parse(data) as {
          choices?: {
            delta?: {
              tool_calls?: {
                index?: number;
                id?: string;
                function?: { name?: string; arguments?: string };
              }[];
            };
          }[];
        };
        for (const call of json.choices?.[0]?.delta?.tool_calls ?? []) {
          const entry = pending.get(call.index ?? 0) ?? { id: "", name: "", args: "" };
          if (call.id) entry.id = call.id;
          if (call.function?.name) entry.name = call.function.name;
          entry.args += call.function?.arguments ?? "";
          pending.set(call.index ?? 0, entry);
        }
      } catch {
        // dòng không phải JSON hợp lệ: vẫn chuyển tiếp nguyên trạng.
      }
    }
    controller.enqueue(encoder.encode(`${line}\n`));
  };

  return source.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach((line) => handleLine(line, controller));
      },
      flush(controller) {
        if (buffer + decoder.decode()) handleLine(buffer, controller);
        if (!sawDone) return;
        for (const call of pending.values()) {
          if (!call.name) continue;
          const params = parseArgs(call.args);
          const payload = {
            id: call.id || `call-${Date.now()}`,
            name: call.name,
            params,
            result: runDemoTool(call.name, params),
            calledAt: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ [TOOL_EVENT_KEY]: payload })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      },
    }),
  );
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
        tools: DEMO_TOOLS,
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

  return new Response(withToolExecution(upstream.body), {
    status: 200,
    headers: {
      ...corsHeaders(),
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
