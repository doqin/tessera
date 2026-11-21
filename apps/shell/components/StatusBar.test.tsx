import { render, screen } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import { StatusBar } from "./StatusBar";

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("StatusBar", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/dashboard");
    useIntegrationStore.setState({
      lastToolCall: null,
      toolCallHistory: [],
      locale: "vi",
    });
  });

  it("shows route, session, tool count and the empty last-tool state", () => {
    render(<StatusBar />);
    expect(screen.getByText("/dashboard")).toBeInTheDocument();
    expect(screen.getByText("Đã kết nối")).toBeInTheDocument();
    expect(screen.getByText("chưa có")).toBeInTheDocument();
    expect(screen.getByText(/Module Federation/)).toBeInTheDocument();
  });

  it("reflects store updates live", () => {
    const call = { id: "1", name: "get_weather", params: {}, calledAt: "now", result: "ok" };
    useIntegrationStore.setState({ lastToolCall: call, toolCallHistory: [call] });

    render(<StatusBar />);
    expect(screen.getByText("get_weather")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
