import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "../types/chat";

function makeMessage(overrides: Partial<Message>): Message {
  return {
    id: "1",
    role: "agent",
    content: "nội dung",
    status: "sent",
    createdAt: "now",
    ...overrides,
  };
}

describe("MessageBubble", () => {
  it("renders the message content", () => {
    render(<MessageBubble message={makeMessage({ content: "xin chào" })} />);
    expect(screen.getByText("xin chào")).toBeInTheDocument();
  });

  it("shows an error hint when status is error", () => {
    render(<MessageBubble message={makeMessage({ status: "error" })} />);
    expect(screen.getByText(/Lỗi\/timeout/)).toBeInTheDocument();
  });

  it("shows an interrupted hint when status is interrupted", () => {
    render(<MessageBubble message={makeMessage({ status: "interrupted" })} />);
    expect(screen.getByText(/bị ngắt/)).toBeInTheDocument();
  });

  it("does not show any status hint when status is sent", () => {
    render(<MessageBubble message={makeMessage({ status: "sent" })} />);
    expect(screen.queryByText(/Lỗi\/timeout/)).not.toBeInTheDocument();
    expect(screen.queryByText(/bị ngắt/)).not.toBeInTheDocument();
  });
});
