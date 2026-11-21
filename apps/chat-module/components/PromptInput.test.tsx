import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptInput } from "./PromptInput";

describe("PromptInput", () => {
  it("submits the trimmed prompt and clears the input", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<PromptInput onSubmit={handleSubmit} />);

    const input = screen.getByLabelText("Prompt");
    await user.type(input, "  hỏi agent  ");
    await user.click(screen.getByRole("button", { name: "Gửi" }));

    expect(handleSubmit).toHaveBeenCalledWith("  hỏi agent  ");
    expect(input).toHaveValue("");
  });

  it("disables submit while the input is empty", () => {
    render(<PromptInput onSubmit={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Gửi" })).toBeDisabled();
  });

  it("does not call onSubmit for a whitespace-only prompt", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<PromptInput onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText("Prompt"), "   ");
    expect(screen.getByRole("button", { name: "Gửi" })).toBeDisabled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("submits with Enter and keeps a newline with Shift+Enter", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<PromptInput onSubmit={handleSubmit} />);
    const input = screen.getByLabelText("Prompt");

    await user.type(input, "dòng một{Shift>}{Enter}{/Shift}dòng hai");
    expect(input).toHaveValue("dòng một\ndòng hai");

    await user.keyboard("{Enter}");
    expect(handleSubmit).toHaveBeenCalledWith("dòng một\ndòng hai");
  });

  it("shows the stop button while sending and calls onStop", async () => {
    const user = userEvent.setup();
    const onStop = jest.fn();
    render(<PromptInput onSubmit={jest.fn()} onStop={onStop} isSending />);

    await user.click(screen.getByRole("button", { name: "Dừng" }));
    expect(onStop).toHaveBeenCalled();
  });

  it("shows the character counter", async () => {
    const user = userEvent.setup();
    render(<PromptInput onSubmit={jest.fn()} maxLength={100} />);
    await user.type(screen.getByLabelText("Prompt"), "abc");
    expect(screen.getByText("3/100")).toBeInTheDocument();
  });
});
