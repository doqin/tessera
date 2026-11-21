import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import SettingsPage from "./page";

describe("SettingsPage", () => {
  beforeEach(() => {
    useIntegrationStore.setState({ locale: "vi" });
    document.documentElement.dataset.theme = "light";
  });

  it("moves language and theme out of the header into one settings surface", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("heading", { name: "Cài đặt" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sáng" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "VI" })).toHaveAttribute("aria-pressed", "true");
  });

  it("applies the dark theme immediately", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: "Tối" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("applies the language to the whole app through the shared store", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: "EN" }));
    expect(useIntegrationStore.getState().locale).toBe("en");
  });
});
