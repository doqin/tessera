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
});
