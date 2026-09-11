import { render, screen } from "@testing-library/react";
import { AppHeader } from "./AppHeader";

describe("AppHeader", () => {
  it("renders the shell title", () => {
    render(<AppHeader />);
    expect(screen.getByText("AI Agent UI — Shell")).toBeInTheDocument();
  });
});
