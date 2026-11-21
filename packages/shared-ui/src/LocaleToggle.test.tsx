import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import { LocaleToggle } from "./LocaleToggle";

describe("LocaleToggle", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ locale: "vi" });
  });

  it("marks the active locale and switches to English", async () => {
    const user = userEvent.setup();
    render(<LocaleToggle />);

    expect(screen.getByRole("button", { name: "VI" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "EN" }));

    expect(useIntegrationStore.getState().locale).toBe("en");
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
  });
});
