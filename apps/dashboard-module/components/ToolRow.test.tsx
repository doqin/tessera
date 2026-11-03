import { render, screen } from "@testing-library/react";
import type { ToolCall } from "../types/dashboard";
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
    expect(screen.getByText(/Tool:/)).toBeInTheDocument();
    expect(screen.getByText("mock_tool")).toBeInTheDocument();
  });

  it("renders the called-at timestamp", () => {
    render(<ToolRow toolCall={makeToolCall()} />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("renders parameters as formatted JSON", () => {
    render(<ToolRow toolCall={makeToolCall()} />);
    expect(screen.getByText(/Tham số/)).toBeInTheDocument();
    expect(screen.getByText(/"query": "demo"/)).toBeInTheDocument();
  });

  it("renders result as formatted JSON", () => {
    render(<ToolRow toolCall={makeToolCall()} />);
    expect(screen.getByText(/Kết quả/)).toBeInTheDocument();
    expect(screen.getByText(/"summary": "done"/)).toBeInTheDocument();
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
  it("renders array parameters as JSON", () => {
    const toolCall = makeToolCall({
      params: { tags: ["a", "b"], nums: [1, 2, 3] },
    });
    const { container } = render(<ToolRow toolCall={toolCall} />);
    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();
    const text = pre?.textContent ?? "";
    expect(text).toContain("tags");
    expect(text).toContain("nums");
    expect(text).toContain("a");
    expect(text).toContain("b");
    expect(text).toContain("1");
    expect(text).toContain("2");
    expect(text).toContain("3");
  });
  it("renders null params as string", () => {
    const toolCall = makeToolCall({ params: null });
    render(<ToolRow toolCall={toolCall} />);
    expect(screen.getByText("null")).toBeInTheDocument();
  });
});
