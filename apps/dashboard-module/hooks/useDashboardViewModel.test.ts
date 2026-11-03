import { renderHook, act } from "@testing-library/react";
import { useIntegrationStore, type ToolCall } from "@tessera/integration-store";
import { useDashboardViewModel } from "./useDashboardViewModel";

const makeToolCall = (overrides = {}) => ({
  id: "t1",
  name: "mock_tool",
  params: { query: "demo" },
  result: "ok",
  calledAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("useDashboardViewModel", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ lastToolCall: null });
  });

  it("initializes with the store's lastToolCall", () => {
    const toolCall = makeToolCall();
    useIntegrationStore.setState({ lastToolCall: toolCall });
    const { result } = renderHook(() => useDashboardViewModel());
    expect(result.current.lastToolCall).toEqual(toolCall);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it("isProcessing becomes true when result is undefined", async () => {
    useIntegrationStore.setState({ lastToolCall: makeToolCall() });
    const { result } = renderHook(() => useDashboardViewModel());
    await act(async () => {
      useIntegrationStore.getState().setLastToolCall({
        ...makeToolCall(),
        result: undefined,
      } as ToolCall);
    });
    expect(result.current.isProcessing).toBe(true);
  });

  it("errorMessage is set when result is an Error", async () => {
    const err = new Error("tool failed");
    useIntegrationStore.setState({ lastToolCall: makeToolCall() });
    const { result } = renderHook(() => useDashboardViewModel());
    await act(async () => {
      useIntegrationStore.getState().setLastToolCall({
        ...makeToolCall(),
        result: err,
      } as ToolCall);
    });
    expect(result.current.errorMessage).toBe("tool failed");
  });

  it("exposes the latest lastToolCall after store updates", async () => {
    const first = makeToolCall({ id: "t1", result: "ok1" });
    const second = makeToolCall({ id: "t2", result: "ok2" });
    useIntegrationStore.setState({ lastToolCall: first });
    const { result } = renderHook(() => useDashboardViewModel());
    await act(async () => {
      useIntegrationStore.getState().setLastToolCall(second);
    });
    expect(result.current.lastToolCall).toEqual(second);
  });
});
