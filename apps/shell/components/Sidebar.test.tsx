import { render, screen } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import { Sidebar } from "./Sidebar";

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("Sidebar", () => {
  beforeEach(() => {
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
});
