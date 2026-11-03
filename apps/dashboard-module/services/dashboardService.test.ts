import { useIntegrationStore } from "@tessera/integration-store";
import { readLastToolCall } from "./dashboardService";

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
