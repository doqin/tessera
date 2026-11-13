import type { ToolCall } from "@tessera/integration-store";

/**
 * Hai tool mẫu của PoC (specs/002-chat-module/spec.md §9): chỉ trả dữ liệu giả, không gọi dịch vụ
 * ngoài (NFR7). Khác kiểu `result` (object / mảng) để Dashboard hiển thị đủ kiểu dữ liệu.
 */
export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Lấy thời tiết hiện tại của một thành phố (dữ liệu mẫu).",
      parameters: {
        type: "object",
        properties: { city: { type: "string", description: "Tên thành phố, ví dụ Hà Nội" } },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_docs",
      description: "Tìm tài liệu nội bộ theo từ khoá (dữ liệu mẫu).",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Từ khoá tìm kiếm" } },
        required: ["query"],
      },
    },
  },
] as const;

type ToolHandler = (params: Record<string, unknown>) => unknown;

const str = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const HANDLERS: Record<string, ToolHandler> = {
  get_weather: (params) => ({
    city: str(params.city, "Hà Nội"),
    temperatureC: 28,
    condition: "Nhiều mây",
  }),
  search_docs: (params) => {
    const query = str(params.query, "");
    return [
      { title: `Giới thiệu: ${query}`, snippet: "Đoạn mô tả mẫu số 1." },
      { title: `Hướng dẫn: ${query}`, snippet: "Đoạn mô tả mẫu số 2." },
    ];
  },
};

export function isKnownTool(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(HANDLERS, name);
}

/** Chạy tool mẫu; trả `undefined` nếu tool không tồn tại. */
export function executeTool(
  name: string,
  params: Record<string, unknown>,
): Pick<ToolCall, "result"> | undefined {
  const handler = isKnownTool(name) ? HANDLERS[name] : undefined;
  return handler ? { result: handler(params) } : undefined;
}
