import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardContent } from "./Card";

describe("Card", () => {
  it("renders its children", () => {
    render(<Card>Nội dung thẻ</Card>);
    expect(screen.getByText("Nội dung thẻ")).toBeInTheDocument();
  });

  it("applies the shared card classes", () => {
    render(<Card data-testid="card">Card</Card>);
    expect(screen.getByTestId("card").className).toContain("rounded-lg");
  });

  it("merges a custom className with the base classes", () => {
    render(
      <Card data-testid="card" className="extra-class">
        Card
      </Card>,
    );
    expect(screen.getByTestId("card").className).toContain("extra-class");
    expect(screen.getByTestId("card").className).toContain("border");
  });

  it("forwards ref to the underlying div element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>Ref</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("composes with CardHeader and CardContent", () => {
    render(
      <Card>
        <CardHeader>Tiêu đề</CardHeader>
        <CardContent>Chi tiết</CardContent>
      </Card>,
    );
    expect(screen.getByText("Tiêu đề")).toBeInTheDocument();
    expect(screen.getByText("Chi tiết")).toBeInTheDocument();
  });
});
