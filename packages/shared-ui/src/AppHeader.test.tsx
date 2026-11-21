import { render, screen } from "@testing-library/react";
import { AppHeader } from "./AppHeader";
import { useIntegrationStore } from "@tessera/integration-store";

describe("AppHeader", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ locale: "vi" });
  });

  it("renders the product brand and tagline", () => {
    render(<AppHeader />);
    expect(screen.getByText("Tessera")).toBeInTheDocument();
    expect(screen.getByText("AI Agent Console")).toBeInTheDocument();
  });

  it("renders custom title, breadcrumb and actions", () => {
    render(
      <AppHeader
        title="Custom"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Chat" }]}
        actions={<button type="button">action</button>}
      />,
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByText("Chat")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "action" })).toBeInTheDocument();
  });
});
