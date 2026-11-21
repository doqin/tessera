import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "../types/chat";

function makeMessage(overrides: Partial<Message>): Message {
  return {
    id: "1",
    role: "agent",
    content: "nội dung",
    status: "sent",
    createdAt: "2026-01-01T10:00:00Z",
    ...overrides,
  };
}

describe("MessageBubble", () => {
  it("renders the message content", () => {
    render(<MessageBubble message={makeMessage({ content: "xin chào" })} />);
    expect(screen.getByText("xin chào")).toBeInTheDocument();
  });

  it("renders markdown for agent messages", () => {
    render(<MessageBubble message={makeMessage({ content: "**đậm** và `code`" })} />);
    expect(screen.getByText("đậm").tagName).toBe("STRONG");
    expect(screen.getByText("code").tagName).toBe("CODE");
  });

  it("shows an error hint when status is error", () => {
    render(<MessageBubble message={makeMessage({ status: "error" })} />);
    expect(screen.getByText(/Không nhận được phản hồi/)).toBeInTheDocument();
  });

  it("shows an interrupted hint when status is interrupted", () => {
    render(<MessageBubble message={makeMessage({ status: "interrupted" })} />);
    expect(screen.getByText(/bị ngắt/)).toBeInTheDocument();
  });

  it("does not show any status hint when status is sent", () => {
    render(<MessageBubble message={makeMessage({ status: "sent" })} />);
    expect(screen.queryByText(/Không nhận được phản hồi/)).not.toBeInTheDocument();
    expect(screen.queryByText(/bị ngắt/)).not.toBeInTheDocument();
  });

  it("shows the tool badge and duration when present", () => {
    render(<MessageBubble message={makeMessage({ toolName: "get_weather", durationMs: 420 })} />);
    expect(screen.getByText("get_weather")).toBeInTheDocument();
    expect(screen.getByText("420 ms")).toBeInTheDocument();
  });

  it("copies the message content", async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<MessageBubble message={makeMessage({ content: "sao chép tôi" })} />);

    await user.click(screen.getByRole("button", { name: /Sao chép — Agent/ }));
    expect(writeText).toHaveBeenCalledWith("sao chép tôi");
    expect(await screen.findByText("Đã chép")).toBeInTheDocument();
  });

  it("offers regenerate only for finished agent messages", async () => {
    const user = userEvent.setup();
    const onRegenerate = jest.fn();
    const { rerender } = render(
      <MessageBubble message={makeMessage({})} onRegenerate={onRegenerate} />,
    );
    await user.click(screen.getByRole("button", { name: /Tạo lại/ }));
    expect(onRegenerate).toHaveBeenCalledWith("1");

    rerender(<MessageBubble message={makeMessage({})} isStreaming onRegenerate={onRegenerate} />);
    expect(screen.queryByRole("button", { name: /Tạo lại/ })).not.toBeInTheDocument();
  });

  it("offers retry on error messages", async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(<MessageBubble message={makeMessage({ status: "error" })} onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: /Thử lại/ }));
    expect(onRetry).toHaveBeenCalledWith("1");
  });
});
