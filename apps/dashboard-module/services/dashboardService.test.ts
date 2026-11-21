import { useIntegrationStore } from "@tessera/integration-store";
import { clearToolCallHistory, readLastToolCall, readToolCallHistory } from "./dashboardService";

const makeToolCall = (overrides = {}) => ({
  id: "t1",
  name: "mock_tool",
  params: { query: "demo" },
  result: "ok",
  calledAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("dashboardService.readLastToolCall", () => {
  it("returns the lastToolCall from the shared store", () => {
    useIntegrationStore.setState({ lastToolCall: makeToolCall() });
    expect(readLastToolCall()).toEqual(makeToolCall());
  });

  it("returns null when the store has no lastToolCall", () => {
    useIntegrationStore.setState({ lastToolCall: null });
    expect(readLastToolCall()).toBeNull();
  });
});

describe("dashboardService history", () => {
  it("reads the tool call history", () => {
    useIntegrationStore.setState({ toolCallHistory: [makeToolCall()] });
    expect(readToolCallHistory()).toEqual([makeToolCall()]);
  });

  it("clears the history through the store", () => {
    useIntegrationStore.setState({
      lastToolCall: makeToolCall(),
      toolCallHistory: [makeToolCall()],
    });
    clearToolCallHistory();
    expect(readToolCallHistory()).toEqual([]);
    expect(readLastToolCall()).toBeNull();
  });
});
