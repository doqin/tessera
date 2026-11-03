import { render, screen } from "@testing-library/react";
import type { DashboardState } from "../types/dashboard";
import DashboardWindow from "./DashboardWindow";

const makeState = (overrides = {}): DashboardState => ({
  lastToolCall: null,
  isProcessing: false,
  errorMessage: null,
  ...overrides,
});

describe("DashboardWindow", () => {
  it("renders EmptyState when lastToolCall is null", () => {
    render(<DashboardWindow state={makeState()} />);
    expect(screen.getByText("Chưa có tool nào được gọi")).toBeInTheDocument();
  });

  it("renders ProcessingIndicator when isProcessing is true", () => {
    render(
      <DashboardWindow
        state={makeState({
          lastToolCall: { id: "t1", name: "t", params: {}, calledAt: "now" },
          isProcessing: true,
          errorMessage: null,
        })}
      />,
    );
    expect(screen.getByText(/Đang xử lý/)).toBeInTheDocument();
  });

  it("renders ErrorIndicator when errorMessage is set", () => {
    render(
      <DashboardWindow
        state={{
          ...makeState(),
          lastToolCall: { id: "t1", name: "t", params: {}, calledAt: "now", result: null },
          isProcessing: false,
          errorMessage: "lỗi rồi",
        }}
      />,
    );
    expect(screen.getByText(/lỗi rồi/)).toBeInTheDocument();
  });

  it("renders ToolRow when lastToolCall is present", () => {
    render(
      <DashboardWindow
        state={makeState({
          lastToolCall: { id: "t1", name: "mock_tool", params: {}, result: "ok", calledAt: "now" },
          isProcessing: false,
          errorMessage: null,
        })}
      />,
    );
    expect(screen.getByText(/mock_tool/)).toBeInTheDocument();
    expect(screen.getByText(/Kết quả/)).toBeInTheDocument();
  });
});
