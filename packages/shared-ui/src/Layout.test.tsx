import { fireEvent, render, screen } from "@testing-library/react";
import { Layout } from "./Layout";
import { useSidebarState } from "./sidebarState";

function MenuButton() {
  const { toggleMobile } = useSidebarState();
  return (
    <button type="button" id="nav-toggle" onClick={toggleMobile}>
      Menu
    </button>
  );
}

describe("Layout", () => {
  it("renders children in the main content area", () => {
    render(<Layout>Nội dung chính</Layout>);
    expect(screen.getByText("Nội dung chính")).toBeInTheDocument();
  });

  it("renders header and sidebar when provided", () => {
    render(
      <Layout header={<span>Header</span>} sidebar={<span>Sidebar</span>}>
        Nội dung
      </Layout>,
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
  });

  it("omits header/sidebar wrappers when not provided", () => {
    render(<Layout>Nội dung</Layout>);
    expect(document.querySelector("header")).not.toBeInTheDocument();
    expect(document.querySelector("aside")).not.toBeInTheDocument();
  });

  it("opens the navigation drawer from the hamburger and closes it from the scrim", () => {
    render(
      <Layout header={<MenuButton />} sidebar={<a href="/chat">Chat</a>}>
        Nội dung
      </Layout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const aside = screen.getByRole("complementary");
    expect(aside).toHaveClass("ts-sidebar--mobile-open");
    expect(screen.getByRole("button", { name: "Đóng menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Đóng menu" }));
    expect(aside).not.toHaveClass("ts-sidebar--mobile-open");
  });
});
