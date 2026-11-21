import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { ChatWindow } from "./ChatWindow";
import type { Message } from "../types/chat";

describe("ChatWindow", () => {
  it("shows the empty state with suggestion chips when there are no messages", () => {
    render(<ChatWindow messages={[]} />);
    expect(screen.getByText("Bạn muốn agent làm gì?")).toBeInTheDocument();
    expect(screen.getByText(/Gọi get_weather/)).toBeInTheDocument();
  });

  it("forwards a clicked suggestion to onSuggestion", async () => {
    const user = userEvent.setup();
    const onSuggestion = jest.fn();
    render(<ChatWindow messages={[]} onSuggestion={onSuggestion} />);

    await user.click(screen.getByRole("button", { name: /Tìm tài liệu về module federation/ }));
    expect(onSuggestion).toHaveBeenCalledWith("Tìm tài liệu về module federation");
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

  it("marks the streaming message for the cursor", () => {
    const messages: Message[] = [
      { id: "1", role: "agent", content: "đang viết", status: "sent", createdAt: "t1" },
    ];
    const { container } = render(<ChatWindow messages={messages} streamingId="1" />);
    expect(container.querySelector(".ts-cursor")).not.toBeNull();
  });
});
