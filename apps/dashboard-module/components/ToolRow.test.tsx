import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import type { ToolCall } from "../types/dashboard";
import { PAYLOAD_PREVIEW_LIMIT } from "../services/payloadFormatter";
import ToolRow from "./ToolRow";

const makeToolCall = (overrides = {}): ToolCall =>
  ({
    id: "t1",
    name: "mock_tool",
    params: { query: "demo" },
    result: { summary: "done" },
    calledAt: "2026-01-01T00:00:00Z",
    ...overrides,
  }) as ToolCall;

describe("ToolRow", () => {
  it("renders the tool name", () => {
    render(<ToolRow toolCall={makeToolCall()} />);
    expect(screen.getByText("mock_tool")).toBeInTheDocument();
  });

  it("renders the called-at timestamp", () => {
    render(<ToolRow toolCall={makeToolCall()} />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("renders object parameters as key-value rows", () => {
    render(<ToolRow toolCall={makeToolCall()} />);
    expect(screen.getByText(/Tham số/)).toBeInTheDocument();
    expect(screen.getByText("query")).toBeInTheDocument();
    expect(screen.getByText("demo")).toBeInTheDocument();
  });

  it("renders object result as key-value rows", () => {
    render(<ToolRow toolCall={makeToolCall()} />);
    expect(screen.getByText(/Kết quả/)).toBeInTheDocument();
    expect(screen.getByText("summary")).toBeInTheDocument();
    expect(screen.getByText("done")).toBeInTheDocument();
  });

  it("formats non-JSON result via String fallback", () => {
    const toolCall = makeToolCall({ result: 42 });
    render(<ToolRow toolCall={toolCall} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("formats non-JSON-serializable result via String fallback", () => {
    const toolCall = makeToolCall({ result: () => "func" });
    render(<ToolRow toolCall={toolCall} />);
    expect(screen.getByText(/func/)).toBeInTheDocument();
  });

  it("renders array parameters with index keys and compact JSON values", () => {
    const toolCall = makeToolCall({
      params: { tags: ["a", "b"], nums: [1, 2, 3] },
    });
    const { container } = render(<ToolRow toolCall={toolCall} />);
    const text = container.textContent ?? "";
    expect(text).toContain("tags");
    expect(text).toContain('["a","b"]');
    expect(text).toContain("nums");
    expect(text).toContain("[1,2,3]");
  });

  it("renders null params as string", () => {
    const toolCall = makeToolCall({ params: null });
    render(<ToolRow toolCall={toolCall} />);
    expect(screen.getByText("null")).toBeInTheDocument();
  });

  it("shows a waiting placeholder instead of 'undefined' while the result is pending", () => {
    const toolCall = makeToolCall({ result: undefined });
    const { container } = render(<ToolRow toolCall={toolCall} />);
    expect(screen.getByText("Đang chờ kết quả…")).toBeInTheDocument();
    expect(container.textContent).not.toContain("undefined");
  });

  it("shows an Error result as its message", () => {
    render(<ToolRow toolCall={makeToolCall({ result: new Error("tool failed") })} />);
    expect(screen.getByText("tool failed")).toBeInTheDocument();
  });

  it("truncates long values by default and expands/collapses them on click", async () => {
    const user = userEvent.setup();
    const longValue = "a".repeat(PAYLOAD_PREVIEW_LIMIT + 100);
    const { container } = render(
      <ToolRow toolCall={makeToolCall({ result: { body: longValue } })} />,
    );

    expect(container.textContent).toContain(`${"a".repeat(PAYLOAD_PREVIEW_LIMIT)}…`);
    expect(container.textContent).not.toContain(longValue);

    const toggle = screen.getByRole("button", { name: "Mở rộng" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(container.textContent).toContain(longValue);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Thu gọn");

    await user.click(toggle);
    expect(container.textContent).not.toContain(longValue);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("expands every long entry of a block with a single button", async () => {
    const user = userEvent.setup();
    const first = "b".repeat(PAYLOAD_PREVIEW_LIMIT + 10);
    const second = "c".repeat(PAYLOAD_PREVIEW_LIMIT + 10);
    const { container } = render(
      <ToolRow toolCall={makeToolCall({ result: { first, second } })} />,
    );

    expect(screen.getAllByRole("button", { name: "Mở rộng" })).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Mở rộng" }));
    expect(container.textContent).toContain(first);
    expect(container.textContent).toContain(second);
  });

  it("truncates long text results (non-container payloads)", async () => {
    const user = userEvent.setup();
    const longText = `start ${"d".repeat(PAYLOAD_PREVIEW_LIMIT + 20)}`;
    const { container } = render(<ToolRow toolCall={makeToolCall({ result: longText })} />);

    expect(container.textContent).not.toContain(longText);
    await user.click(screen.getByRole("button", { name: "Mở rộng" }));
    expect(container.textContent).toContain(longText);
  });

  it("renders no expand button when every value is short", () => {
    render(<ToolRow toolCall={makeToolCall()} />);
    expect(screen.queryByRole("button", { name: "Mở rộng" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thu gọn" })).not.toBeInTheDocument();
  });

  it("resets the expanded state when a different tool call is rendered", async () => {
    const user = userEvent.setup();
    const longValue = "e".repeat(PAYLOAD_PREVIEW_LIMIT + 40);
    const { container, rerender } = render(
      <ToolRow toolCall={makeToolCall({ result: { body: longValue } })} />,
    );

    await user.click(screen.getByRole("button", { name: "Mở rộng" }));
    expect(container.textContent).toContain(longValue);

    rerender(<ToolRow toolCall={makeToolCall({ id: "t2", result: { body: longValue } })} />);
    expect(container.textContent).not.toContain(longValue);
    expect(screen.getByRole("button", { name: "Mở rộng" })).toBeInTheDocument();
  });
});
