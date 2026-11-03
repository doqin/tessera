import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders the default placeholder message", () => {
    render(<EmptyState />);
    expect(screen.getByText("Chưa có tool nào được gọi")).toBeInTheDocument();
  });

  it("renders a custom message", () => {
    render(<EmptyState message="Chưa có gì cả" />);
    expect(screen.getByText("Chưa có gì cả")).toBeInTheDocument();
  });
});
