import { render, screen } from "@testing-library/react";
import { ChatWindow } from "./ChatWindow";
import type { Message } from "../types/chat";

describe("ChatWindow", () => {
  it("shows an empty-state hint when there are no messages", () => {
    render(<ChatWindow messages={[]} />);
    expect(screen.getByText(/Chưa có tin nhắn/)).toBeInTheDocument();
  });

  it("renders messages in the given order", () => {
    const messages: Message[] = [
      { id: "1", role: "user", content: "câu hỏi", status: "sent", createdAt: "t1" },
      { id: "2", role: "agent", content: "câu trả lời", status: "sent", createdAt: "t2" },
    ];
    render(<ChatWindow messages={messages} />);

    const rendered = screen.getAllByText(/câu (hỏi|trả lời)/).map((node) => node.textContent);
    expect(rendered).toEqual(["câu hỏi", "câu trả lời"]);
  });
});
