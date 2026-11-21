import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import ToolTimeline from "./ToolTimeline";
import type { ToolCall } from "../types/dashboard";

const call = (overrides: Partial<ToolCall> = {}): ToolCall => ({
  id: "t1",
  name: "get_weather",
  params: { city: "Hà Nội" },
  result: "ok",
  calledAt: "2026-01-01T10:00:00Z",
  durationMs: 120,
  status: "success",
  ...overrides,
});

describe("ToolTimeline", () => {
  it("shows a no-match message for an empty list", () => {
    render(<ToolTimeline calls={[]} />);
    expect(screen.getByText(/Không có lượt gọi tool/)).toBeInTheDocument();
  });

  it("renders each call with time and duration", () => {
    render(<ToolTimeline calls={[call()]} />);
    expect(screen.getByText("get_weather")).toBeInTheDocument();
    expect(screen.getByText(/120 ms/)).toBeInTheDocument();
  });

  it("marks the selected call and reports clicks", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(
      <ToolTimeline
        calls={[call({ id: "a", name: "first" }), call({ id: "b", name: "second" })]}
        selectedId="b"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("button", { name: /second/ })).toHaveAttribute("aria-current", "true");
    await user.click(screen.getByRole("button", { name: /first/ }));
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("marks failed calls", () => {
    const { container } = render(<ToolTimeline calls={[call({ status: "error" })]} />);
    expect(container.querySelector(".ts-timeline__dot--error")).not.toBeNull();
    expect(screen.getByText(/Lỗi/)).toBeInTheDocument();
  });
});
