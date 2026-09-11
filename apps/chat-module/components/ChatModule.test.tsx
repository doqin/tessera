import { render, screen } from "@testing-library/react";
import ChatModule from "./ChatModule";

describe("ChatModule", () => {
  it("renders the empty chat window and the prompt input on mount", () => {
    render(<ChatModule />);
    expect(screen.getByText(/Chưa có tin nhắn/)).toBeInTheDocument();
    expect(screen.getByLabelText("Prompt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi" })).toBeInTheDocument();
  });
});
