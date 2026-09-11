import { render, screen } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import { ZoneNav } from "./ZoneNav";

describe("ZoneNav", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ navState: { currentRoute: "/" } });
  });

  it("renders links for Chat and Dashboard with Chat marked active", () => {
    render(<ZoneNav />);
    expect(screen.getByRole("link", { name: "Chat" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("syncs '/chat' into the shared integration store on mount", () => {
    render(<ZoneNav />);
    expect(useIntegrationStore.getState().navState).toEqual({ currentRoute: "/chat" });
  });
});
