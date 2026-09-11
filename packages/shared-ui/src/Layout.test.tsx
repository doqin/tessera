import { render, screen } from "@testing-library/react";
import { Layout } from "./Layout";

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
});
