import { fireEvent, render, screen } from "@testing-library/react";
import { SidebarPanel } from "./SidebarPanel";
import { SidebarStateProvider } from "./sidebarState";

function renderPanel() {
  return render(
    <SidebarStateProvider>
      <SidebarPanel>
        <a href="/chat">Chat</a>
      </SidebarPanel>
    </SidebarStateProvider>,
  );
}

describe("SidebarPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders its children expanded by default", () => {
    renderPanel();
    expect(screen.getByRole("link", { name: "Chat" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Thu gọn menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("collapses the rail but keeps the links reachable", () => {
    renderPanel();
    const toggle = screen.getByRole("button", { name: "Thu gọn menu" });
    fireEvent.click(toggle);

    expect(screen.getByRole("link", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mở rộng menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("remembers the collapsed state for the next visit", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Thu gọn menu" }));
    expect(window.localStorage.getItem("tessera-sidebar-collapsed")).toBe("1");
  });
});
