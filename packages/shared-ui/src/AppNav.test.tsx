import { render, screen } from "@testing-library/react";
import { AppNav } from "./AppNav";

const items = [
  { href: "/chat", label: "Chat" },
  { href: "/dashboard", label: "Dashboard" },
];

describe("AppNav", () => {
  it("renders a plain <a> link for every item (cross-zone safe)", () => {
    render(<AppNav items={items} activeHref="/chat" />);
    const chatLink = screen.getByRole("link", { name: "Chat" });
    expect(chatLink.tagName).toBe("A");
    expect(chatLink).toHaveAttribute("href", "/chat");
  });

  it("marks the active item with aria-current", () => {
    render(<AppNav items={items} activeHref="/dashboard" />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Chat" })).not.toHaveAttribute("aria-current");
  });

  it("marks no item active when activeHref matches none", () => {
    render(<AppNav items={items} activeHref="/somewhere-else" />);
    expect(screen.getByRole("link", { name: "Chat" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });
});
