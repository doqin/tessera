import { fireEvent, render, screen } from "@testing-library/react";
import { SidebarPanel } from "./SidebarPanel";

describe("SidebarPanel", () => {
  it("renders title and children expanded by default", () => {
    render(
      <SidebarPanel>
        <a href="/chat">Chat</a>
      </SidebarPanel>,
    );
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chat" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Thu gọn menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("collapses and expands via the toggle button", () => {
    render(
      <SidebarPanel>
        <a href="/chat">Chat</a>
      </SidebarPanel>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Thu gọn menu" }));
    expect(screen.queryByRole("link", { name: "Chat" })).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Mở rộng menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(screen.getByRole("link", { name: "Chat" })).toBeVisible();
  });

  it("can start collapsed", () => {
    render(
      <SidebarPanel defaultCollapsed>
        <a href="/chat">Chat</a>
      </SidebarPanel>,
    );
    expect(screen.queryByRole("link", { name: "Chat" })).not.toBeInTheDocument();
  });
});
