import { render, screen } from "@testing-library/react";
import { Badge, BadgeRow } from "./Badge";
import { Icon } from "./Icon";
import { ThemeScript } from "./ThemeScript";

describe("Badge", () => {
  it("renders children and tone classes", () => {
    render(<Badge tone="success">ok</Badge>);
    const badge = screen.getByText("ok");
    expect(badge).toHaveClass("ts-badge", "ts-badge--success");
  });

  it("renders neutral badges without a tone class", () => {
    render(<Badge>plain</Badge>);
    expect(screen.getByText("plain").className).not.toContain("ts-badge--");
  });

  it("wraps badges in a row", () => {
    render(
      <BadgeRow>
        <Badge>a</Badge>
      </BadgeRow>,
    );
    expect(screen.getByText("a")).toBeInTheDocument();
  });
});

describe("Icon", () => {
  it("renders an aria-hidden svg with the requested size", () => {
    const { container } = render(<Icon name="chat" size={21} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("width", "21");
  });
});

describe("ThemeScript", () => {
  it("injects the boot script", () => {
    const { container } = render(<ThemeScript />);
    expect(container.querySelector("script")?.innerHTML).toContain("tessera-theme");
  });
});
