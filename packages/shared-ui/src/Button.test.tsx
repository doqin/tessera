import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its children as label text", () => {
    render(<Button>Gửi</Button>);
    expect(screen.getByRole("button", { name: "Gửi" })).toBeInTheDocument();
  });

  it("defaults to variant=primary and size=md classes", () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole("button", { name: "Default" });
    expect(button.className).toContain("bg-primary");
    expect(button.className).toContain("h-10");
  });

  it("applies the requested variant and size", () => {
    render(
      <Button variant="ghost" size="lg">
        Ghost
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Ghost" });
    expect(button.className).toContain("hover:bg-accent");
    expect(button.className).toContain("h-12");
  });

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole("button", { name: "Click" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Disabled" }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("forwards ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("defaults type to 'button' so it never submits a wrapping form", () => {
    render(<Button>Type</Button>);
    expect(screen.getByRole("button", { name: "Type" })).toHaveAttribute("type", "button");
  });
});
