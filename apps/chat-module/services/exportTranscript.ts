import type { ChatMessage } from "@tessera/integration-store";

/**
 * Xuất bản ghi hội thoại ra Markdown — dùng để đính kèm minh chứng vào báo cáo/demo.
 *
 * Cố tình không phụ thuộc thư viện: một chuỗi Markdown thuần là đủ, và nó giữ nguyên nội dung
 * model trả về (không render HTML, không có bề mặt XSS).
 */
export interface TranscriptOptions {
  locale?: "vi" | "en";
  generatedAt?: Date;
}

const ROLE_VI = { user: "Người dùng", agent: "Agent" } as const;
const ROLE_EN = { user: "User", agent: "Agent" } as const;

export function transcriptToMarkdown(
  messages: readonly ChatMessage[],
  { locale = "vi", generatedAt = new Date() }: TranscriptOptions = {},
): string {
  const header =
    locale === "en" ? "# Tessera — conversation transcript" : "# Tessera — bản ghi hội thoại";
  const meta = `_${generatedAt.toISOString()}_`;
  const roles = locale === "en" ? ROLE_EN : ROLE_VI;

  const blocks = messages.map((message) => {
    const date = new Date(message.createdAt);
    const stamp = Number.isNaN(date.getTime())
      ? message.createdAt
      : date.toLocaleString(locale === "en" ? "en-US" : "vi-VN");

    const tool = message.toolName ? ` · tool \`${message.toolName}\`` : "";
    const duration = typeof message.durationMs === "number" ? ` · ${message.durationMs} ms` : "";
    const status = message.status === "sent" ? "" : ` · ${message.status}`;

    return `### ${roles[message.role]} · ${stamp}${tool}${duration}${status}\n\n${message.content}`;
  });

  return [header, meta, ...blocks].join("\n\n") + "\n";
}

/**
 * Kích hoạt tải file trong browser. Trả `false` ở môi trường không có DOM (test/SSR) để caller
 * không phải tự kiểm tra.
 */
export function downloadTranscript(filename: string, markdown: string): boolean {
  if (typeof document === "undefined" || typeof URL.createObjectURL !== "function") return false;

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Thu hồi muộn: revoke ngay lập tức có thể huỷ lượt tải trước khi trình duyệt kịp đọc blob.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}
