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

  it("renders items through a custom LinkComponent when provided", () => {
    const CustomLink = ({ href, children }: { href: string; children?: React.ReactNode }) => (
      <span data-testid="custom-link" data-href={href}>
        {children}
      </span>
    );
    render(<AppNav items={items} activeHref="/chat" LinkComponent={CustomLink} />);
    const links = screen.getAllByTestId("custom-link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("data-href", "/chat");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
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
