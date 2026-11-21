import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { useIntegrationStore } from "@tessera/integration-store";
import { ShellHeader } from "./ShellHeader";

const mockPush = jest.fn();
const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush }),
}));

describe("ShellHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/chat");
    useIntegrationStore.setState({ locale: "vi", lastToolCall: null, toolCallHistory: [] });
  });

  it("puts search in the centre and settings on the right, without brand or breadcrumb", () => {
    render(<ShellHeader />);
    expect(screen.getByRole("button", { name: "Mở bảng lệnh" })).toHaveClass("ts-search");
    expect(screen.getByRole("link", { name: "Cài đặt" })).toHaveAttribute("href", "/settings");
    expect(screen.queryByText("Tessera")).not.toBeInTheDocument();
    expect(document.querySelector(".ts-crumb")).not.toBeInTheDocument();
  });

  it("opens the command palette and navigates to Dashboard", async () => {
    const user = userEvent.setup();
    render(<ShellHeader />);

    await user.click(screen.getByRole("button", { name: "Mở bảng lệnh" }));
    const dashboard = screen.getByRole("dialog");
    expect(dashboard).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dashboard" }));
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("toggles the palette with Ctrl+K", async () => {
    const user = userEvent.setup();
    render(<ShellHeader />);

    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the palette from the centred search field", async () => {
    const user = userEvent.setup();
    render(<ShellHeader />);

    await user.click(screen.getByRole("button", { name: "Mở bảng lệnh" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
