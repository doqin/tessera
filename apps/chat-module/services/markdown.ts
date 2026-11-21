/**
 * Markdown tối giản cho phản hồi của agent (specs/004-ui-ux-redesign).
 *
 * Không thêm thư viện markdown (constitution §4) và **không dùng dangerouslySetInnerHTML** —
 * parser trả cấu trúc dữ liệu, View render thành React element nên nội dung model trả về không
 * thể chèn HTML/script.
 *
 * Hỗ trợ: heading (#, ##, ###), danh sách `-`/`*` và `1.`, blockquote `>`, code fence ```lang,
 * và inline **bold**, *italic*, `code`, [link](url).
 */

export type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "bold"; value: string }
  | { kind: "italic"; value: string }
  | { kind: "code"; value: string }
  | { kind: "link"; value: string; href: string };

export type Inline = InlineToken[];

export type MarkdownBlock =
  | { type: "paragraph"; inline: Inline }
  | { type: "heading"; level: 1 | 2 | 3; inline: Inline }
  | { type: "list"; ordered: boolean; items: Inline[] }
  | { type: "quote"; inline: Inline }
  | { type: "code"; lang: string; content: string };

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_|\[[^\]]+\]\([^)\s]+\))/g;

/** Tách một dòng thành các token inline. Không đệ quy để tránh chi phí/độ phức tạp không cần. */
export function parseInline(text: string): Inline {
  const tokens: Inline = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ kind: "text", value: text.slice(lastIndex, index) });
    }
    const raw = match[0];
    tokens.push(tokenize(raw));
    lastIndex = index + raw.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ kind: "text", value: text.slice(lastIndex) });
  }
  return tokens.length > 0 ? tokens : [{ kind: "text", value: text }];
}

function tokenize(raw: string): InlineToken {
  if (raw.startsWith("**") || raw.startsWith("__")) {
    return { kind: "bold", value: raw.slice(2, -2) };
  }
  if (raw.startsWith("`")) {
    return { kind: "code", value: raw.slice(1, -1) };
  }
  if (raw.startsWith("[")) {
    const close = raw.indexOf("](");
    const label = raw.slice(1, close);
    const href = raw.slice(close + 2, -1);
    return { kind: "link", value: label, href };
  }
  return { kind: "italic", value: raw.slice(1, -1) };
}

const HEADING = /^(#{1,3})\s+(.*)$/;
const ORDERED_ITEM = /^\d+[.)]\s+(.*)$/;
const BULLET_ITEM = /^[-*]\s+(.*)$/;
const FENCE = /^```(\w*)\s*$/;

/** Parse toàn bộ văn bản thành danh sách block. */
export function parseMarkdown(text: string): MarkdownBlock[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "paragraph", inline: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const fence = FENCE.exec(line.trim());

    if (fence) {
      flushParagraph();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test((lines[index] ?? "").trim())) {
        code.push(lines[index] ?? "");
        index += 1;
      }
      blocks.push({ type: "code", lang: fence[1] ?? "", content: code.join("\n") });
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    const heading = HEADING.exec(line.trim());
    if (heading) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: Math.min(3, (heading[1] ?? "#").length) as 1 | 2 | 3,
        inline: parseInline(heading[2] ?? ""),
      });
      continue;
    }

    const bullet = BULLET_ITEM.exec(line.trim());
    const ordered = ORDERED_ITEM.exec(line.trim());
    if (bullet || ordered) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      const items: Inline[] = [parseInline((bullet ?? ordered)?.[1] ?? "")];
      while (index + 1 < lines.length) {
        const next = (lines[index + 1] ?? "").trim();
        const nextItem = isOrdered ? ORDERED_ITEM.exec(next) : BULLET_ITEM.exec(next);
        if (!nextItem) break;
        items.push(parseInline(nextItem[1] ?? ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered: isOrdered, items });
      continue;
    }

    if (line.trimStart().startsWith(">")) {
      flushParagraph();
      const quote: string[] = [];
      while (index < lines.length && (lines[index] ?? "").trimStart().startsWith(">")) {
        quote.push((lines[index] ?? "").trimStart().slice(1).trim());
        index += 1;
      }
      index -= 1;
      blocks.push({ type: "quote", inline: parseInline(quote.join(" ")) });
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  return blocks;
}
