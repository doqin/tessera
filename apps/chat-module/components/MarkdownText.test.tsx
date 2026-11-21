import { render, screen } from "@testing-library/react";
import { MarkdownText } from "./MarkdownText";

describe("MarkdownText", () => {
  it("renders headings, lists and quotes", () => {
    const { container } = render(<MarkdownText text={"## Tiêu đề\n\n- một\n- hai\n\n> trích"} />);
    expect(screen.getByRole("heading", { name: "Tiêu đề" })).toBeInTheDocument();
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.querySelector("blockquote")).not.toBeNull();
  });

  it("renders fenced code with its language tag", () => {
    const { container } = render(<MarkdownText text={"```ts\nconst a = 1;\n```"} />);
    const code = container.querySelector("pre code");
    expect(code).toHaveAttribute("data-lang", "ts");
    expect(code?.textContent).toBe("const a = 1;");
  });

  it("renders ordered lists", () => {
    const { container } = render(<MarkdownText text={"1. một\n2. hai"} />);
    expect(container.querySelector("ol")).not.toBeNull();
  });

  it("renders safe links as anchors", () => {
    render(<MarkdownText text={"[tài liệu](https://example.com)"} />);
    expect(screen.getByRole("link", { name: "tài liệu" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });

  it("does not create anchors for unsafe link schemes", () => {
    render(<MarkdownText text={"[x](javascript:alert(1))"} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/x/)).toBeInTheDocument();
  });

  it("renders paragraph text", () => {
    render(<MarkdownText text="chỉ là chữ" />);
    expect(screen.getByText("chỉ là chữ")).toBeInTheDocument();
  });
});
