import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import type { DashboardState, ToolCall } from "../types/dashboard";
import DashboardWindow from "./DashboardWindow";

const makeToolCall = (overrides: Partial<ToolCall> = {}): ToolCall => ({
  id: "t1",
  name: "mock_tool",
  params: { query: "demo" },
  result: "ok",
  calledAt: "2026-01-01T00:00:00Z",
  durationMs: 120,
  status: "success",
  ...overrides,
});

const makeState = (overrides: Partial<DashboardState> = {}): DashboardState => ({
  lastToolCall: null,
  history: [],
  visible: [],
  selected: null,
  metrics: {
    total: 0,
    success: 0,
    failed: 0,
    successRate: 0,
    avgLatencyMs: null,
    distinctTools: 0,
  },
  filter: "all",
  query: "",
  isProcessing: false,
  errorMessage: null,
  ...overrides,
});

describe("DashboardWindow", () => {
  it("renders EmptyState when there is no tool call", () => {
    render(<DashboardWindow state={makeState()} />);
    expect(screen.getByText("Chưa có tool nào được gọi")).toBeInTheDocument();
  });

  it("renders the KPI cards", () => {
    const call = makeToolCall();
    render(
      <DashboardWindow
        state={makeState({
          history: [call],
          visible: [call],
          selected: call,
          lastToolCall: call,
          metrics: {
            total: 1,
            success: 1,
            failed: 0,
            successRate: 100,
            avgLatencyMs: 120,
            distinctTools: 1,
          },
        })}
      />,
    );
    expect(screen.getAllByText("Lượt gọi tool").length).toBeGreaterThan(0);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getAllByText("120 ms").length).toBeGreaterThan(0);
  });

  it("renders the processing indicator when isProcessing is true", () => {
    const call = makeToolCall({ result: undefined });
    render(
      <DashboardWindow
        state={makeState({
          history: [call],
          visible: [call],
          selected: call,
          lastToolCall: call,
          isProcessing: true,
        })}
      />,
    );
    expect(screen.getAllByText(/Đang xử lý/).length).toBeGreaterThan(0);
  });

  it("renders the error indicator when errorMessage is set", () => {
    const call = makeToolCall({ result: null, status: "error" });
    render(
      <DashboardWindow
        state={makeState({
          history: [call],
          visible: [call],
          selected: call,
          lastToolCall: call,
          errorMessage: "lỗi rồi",
        })}
      />,
    );
    expect(screen.getByText(/lỗi rồi/)).toBeInTheDocument();
  });

  it("renders the selected tool in the detail panel", () => {
    const call = makeToolCall();
    render(
      <DashboardWindow
        state={makeState({
          history: [call],
          visible: [call],
          selected: call,
          lastToolCall: call,
        })}
      />,
    );
    expect(screen.getAllByText(/mock_tool/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Kết quả/)).toBeInTheDocument();
  });

  it("selects a tool from the timeline and changes the filter", async () => {
    const user = userEvent.setup();
    const first = makeToolCall({ id: "t1", name: "first_tool" });
    const second = makeToolCall({ id: "t2", name: "second_tool" });
    const onSelect = jest.fn();
    const onFilterChange = jest.fn();

    render(
      <DashboardWindow
        state={makeState({
          history: [first, second],
          visible: [second, first],
          selected: second,
          lastToolCall: second,
        })}
        onSelect={onSelect}
        onFilterChange={onFilterChange}
        onQueryChange={jest.fn()}
        onClear={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /first_tool/ }));
    expect(onSelect).toHaveBeenCalledWith("t1");

    await user.click(screen.getByRole("button", { name: "Lỗi" }));
    expect(onFilterChange).toHaveBeenCalledWith("error");
  });

  it("clears the history from the toolbar", async () => {
    const user = userEvent.setup();
    const call = makeToolCall();
    const onClear = jest.fn();
    render(
      <DashboardWindow
        state={makeState({ history: [call], visible: [call], selected: call, lastToolCall: call })}
        onClear={onClear}
      />,
    );

    // Xoá lịch sử là thao tác không hoàn tác được: bấm lần đầu chỉ "lên cò".
    await user.click(screen.getByRole("button", { name: /Xoá lịch sử/ }));
    expect(onClear).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Xác nhận xoá/ }));
    expect(onClear).toHaveBeenCalled();
  });
});
