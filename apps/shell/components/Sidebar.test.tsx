import { fireEvent, render, screen } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import { Sidebar } from "./Sidebar";
import { loadDashboardRemote } from "./dashboardRemote";

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("./dashboardRemote", () => ({
  loadDashboardRemote: jest.fn(() => Promise.resolve({})),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/chat");
    useIntegrationStore.setState({ navState: { currentRoute: "/" } });
  });

  it("renders a nav link for Chat and Dashboard", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: "Chat" })).toHaveAttribute("href", "/chat");
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
  });

  it("marks the current route's link as active", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: "Chat" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("syncs the current pathname into the shared integration store", () => {
    render(<Sidebar />);
    expect(useIntegrationStore.getState().navState).toEqual({ currentRoute: "/chat" });
  });

  it("prefetches the dashboard remote on hover/focus of the Dashboard link only", () => {
    render(<Sidebar />);
    fireEvent.mouseEnter(screen.getByRole("link", { name: "Chat" }));
    expect(loadDashboardRemote).not.toHaveBeenCalled();
    fireEvent.mouseEnter(screen.getByRole("link", { name: "Dashboard" }));
    fireEvent.focus(screen.getByRole("link", { name: "Dashboard" }));
    expect(loadDashboardRemote).toHaveBeenCalledTimes(2);
  });

  it("swallows prefetch failures", async () => {
    (loadDashboardRemote as jest.Mock).mockRejectedValueOnce(new Error("down"));
    render(<Sidebar />);
    fireEvent.mouseEnter(screen.getByRole("link", { name: "Dashboard" }));
    await Promise.resolve();
  });
});
