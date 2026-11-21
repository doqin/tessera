import { parseInline, parseMarkdown } from "./markdown";

describe("parseInline", () => {
  it("returns a single text token for plain text", () => {
    expect(parseInline("xin chào")).toEqual([{ kind: "text", value: "xin chào" }]);
  });

  it("parses bold, italic, code and links", () => {
    const tokens = parseInline("**đậm** *nghiêng* `code` [link](https://example.com)");
    expect(tokens).toEqual([
      { kind: "bold", value: "đậm" },
      { kind: "text", value: " " },
      { kind: "italic", value: "nghiêng" },
      { kind: "text", value: " " },
      { kind: "code", value: "code" },
      { kind: "text", value: " " },
      { kind: "link", value: "link", href: "https://example.com" },
    ]);
  });

  it("supports underscore variants", () => {
    expect(parseInline("__đậm__")).toEqual([{ kind: "bold", value: "đậm" }]);
    expect(parseInline("_nghiêng_")).toEqual([{ kind: "italic", value: "nghiêng" }]);
  });
});

describe("parseMarkdown", () => {
  it("parses paragraphs separated by blank lines", () => {
    const blocks = parseMarkdown("dòng một\ndòng hai\n\nđoạn hai");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ type: "paragraph" });
    expect(blocks[1]).toMatchObject({ type: "paragraph" });
  });

  it("parses headings with level clamped to 3", () => {
    const blocks = parseMarkdown("# Một\n## Hai\n### Ba");
    expect(blocks.map((block) => (block.type === "heading" ? block.level : null))).toEqual([
      1, 2, 3,
    ]);
  });

  it("parses fenced code blocks with a language tag", () => {
    const blocks = parseMarkdown("```ts\nconst a = 1;\n```");
    expect(blocks).toEqual([{ type: "code", lang: "ts", content: "const a = 1;" }]);
  });

  it("closes an unterminated code fence at end of input", () => {
    const blocks = parseMarkdown("```\nlet x");
    expect(blocks[0]).toMatchObject({ type: "code", content: "let x" });
  });

  it("parses bullet and ordered lists", () => {
    const [bullets, ordered] = parseMarkdown("- một\n- hai\n\n1. đầu\n2. cuối");
    expect(bullets).toMatchObject({ type: "list", ordered: false });
    expect(ordered).toMatchObject({ type: "list", ordered: true });
    if (ordered?.type === "list") expect(ordered.items).toHaveLength(2);
  });

  it("parses blockquotes", () => {
    const blocks = parseMarkdown("> trích dẫn\n> nhiều dòng");
    expect(blocks[0]).toMatchObject({ type: "quote" });
    if (blocks[0]?.type === "quote") {
      expect(blocks[0].inline).toEqual([{ kind: "text", value: "trích dẫn nhiều dòng" }]);
    }
  });

  it("handles CRLF input", () => {
    const blocks = parseMarkdown("- a\r\n- b");
    expect(blocks[0]).toMatchObject({ type: "list" });
  });
});
