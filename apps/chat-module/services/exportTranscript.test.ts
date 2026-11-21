import { transcriptToMarkdown } from "./exportTranscript";
import type { ChatMessage } from "@tessera/integration-store";

const messages: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Thời tiết Hà Nội hôm nay thế nào?",
    status: "sent",
    createdAt: "2026-11-21T10:00:00.000Z",
  },
  {
    id: "m2",
    role: "agent",
    content: "Hà Nội 28°C, nhiều mây.",
    status: "sent",
    createdAt: "2026-11-21T10:00:02.000Z",
    toolName: "get_weather",
    durationMs: 812,
  },
  {
    id: "m3",
    role: "agent",
    content: "Phần đã nhận",
    status: "interrupted",
    createdAt: "2026-11-21T10:00:05.000Z",
  },
];

describe("transcriptToMarkdown", () => {
  it("ghi tiêu đề, thời điểm và từng lượt với vai trò tiếng Việt", () => {
    const md = transcriptToMarkdown(messages, {
      locale: "vi",
      generatedAt: new Date("2026-11-21T11:00:00.000Z"),
    });

    expect(md).toContain("# Tessera — bản ghi hội thoại");
    expect(md).toContain("_2026-11-21T11:00:00.000Z_");
    expect(md).toContain("### Người dùng ·");
    expect(md).toContain("### Agent ·");
    expect(md).toContain("tool `get_weather`");
    expect(md).toContain("812 ms");
    expect(md).toContain("interrupted");
    expect(md).toContain("Hà Nội 28°C, nhiều mây.");
  });

  it("dùng nhãn tiếng Anh khi locale là en", () => {
    const md = transcriptToMarkdown(messages, { locale: "en" });
    expect(md).toContain("# Tessera — conversation transcript");
    expect(md).toContain("### User ·");
    expect(md).toContain("### Agent ·");
  });

  it("trả về chỉ header + meta khi chưa có message", () => {
    const md = transcriptToMarkdown([], { locale: "vi", generatedAt: new Date(0) });
    expect(md.trim().split("\n\n")).toHaveLength(2);
  });
});
