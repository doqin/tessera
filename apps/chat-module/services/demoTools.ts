/**
 * Tool mẫu cho PoC (specs/002-chat-module/tasks.md T016): spec không định nghĩa tool cụ thể và
 * không tự xây orchestration (spec §Exclusions), nên route handler cung cấp 2 tool giả lập với kết
 * quả cố định (dữ liệu mock/dummy — NDA) để chứng minh luồng Agent gọi tool → `lastToolCall` →
 * Dashboard.
 */

export const DEMO_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Lấy thời tiết hiện tại của một thành phố (dữ liệu mẫu).",
      parameters: {
        type: "object",
        properties: { city: { type: "string", description: "Tên thành phố" } },
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

/** Thực thi tool mẫu. Tool lạ không throw — trả về lỗi để Dashboard hiển thị. */
export function runDemoTool(name: string, params: Record<string, unknown>): unknown {
  switch (name) {
    case "get_weather":
      return {
        city: typeof params.city === "string" ? params.city : "không rõ",
        temperature_c: 28,
        condition: "Nắng nhẹ",
      };
    case "search_docs":
      return {
        hits: [
          { title: "Tổng quan Micro Frontend", snippet: "Tài liệu mẫu về kiến trúc MFE." },
          { title: "Module Federation với Next.js", snippet: "Tài liệu mẫu về remote/host." },
        ],
      };
    default:
      return { error: `Tool không tồn tại: ${name}` };
  }
}
