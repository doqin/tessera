import { render, screen } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import DashboardModule from "./DashboardModule";

const makeToolCall = (overrides = {}) => ({
  id: "t1",
  name: "mock_tool",
  params: { query: "demo" },
  result: "ok",
  calledAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("DashboardModule", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ lastToolCall: null });
  });

  it("renders the empty state when lastToolCall is null", () => {
    render(<DashboardModule />);
    expect(screen.getByText("Chưa có tool nào được gọi")).toBeInTheDocument();
  });

  it("renders the tool name once lastToolCall is set", async () => {
    const toolCall = makeToolCall({ result: "ok" });
    useIntegrationStore.setState({ lastToolCall: toolCall });
    render(<DashboardModule />);
    await screen.findByText("mock_tool");
    expect(screen.getByText("mock_tool")).toBeInTheDocument();
  });
});
