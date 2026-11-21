import { Fragment, type ReactNode } from "react";
import { parseMarkdown, type Inline, type MarkdownBlock } from "../services/markdown";

const SAFE_HREF = /^(https?:\/\/|mailto:|\/|#)/i;

function renderInline(tokens: Inline): ReactNode {
  return tokens.map((token, index) => {
    switch (token.kind) {
      case "bold":
        return <strong key={index}>{token.value}</strong>;
      case "italic":
        return <em key={index}>{token.value}</em>;
      case "code":
        return <code key={index}>{token.value}</code>;
      case "link":
        // Chỉ render link với scheme an toàn; còn lại hiển thị như chữ (không chèn HTML).
        return SAFE_HREF.test(token.href) ? (
          <a key={index} href={token.href} target="_blank" rel="noreferrer noopener">
            {token.value}
          </a>
        ) : (
          <Fragment key={index}>{token.value}</Fragment>
        );
      default:
        return <Fragment key={index}>{token.value}</Fragment>;
    }
  });
}

function renderBlock(block: MarkdownBlock, index: number): ReactNode {
  switch (block.type) {
    case "code":
      return (
        <pre key={index}>
          <code data-lang={block.lang || undefined}>{block.content}</code>
        </pre>
      );
    case "heading":
      return block.level >= 3 ? (
        <h4 key={index}>{renderInline(block.inline)}</h4>
      ) : (
        <h3 key={index}>{renderInline(block.inline)}</h3>
      );
    case "list": {
      const items = block.items.map((item, itemIndex) => (
        <li key={itemIndex}>{renderInline(item)}</li>
      ));
      return block.ordered ? <ol key={index}>{items}</ol> : <ul key={index}>{items}</ul>;
    }
    case "quote":
      return <blockquote key={index}>{renderInline(block.inline)}</blockquote>;
    default:
      return <p key={index}>{renderInline(block.inline)}</p>;
  }
}

export interface MarkdownTextProps {
  text: string;
}

/** Render phản hồi agent (Markdown tối giản) dưới dạng React element — không innerHTML. */
export function MarkdownText({ text }: MarkdownTextProps) {
  const blocks = parseMarkdown(text);
  return <div className="ts-md">{blocks.map(renderBlock)}</div>;
}
