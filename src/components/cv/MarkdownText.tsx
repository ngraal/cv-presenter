import type { ReactNode } from "react";

function formatInline(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  // Match ***bold italic***, **bold**, *italic* in that order
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      result.push(
        <strong key={key} className="italic font-semibold text-on-surface">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      result.push(
        <strong key={key} className="font-semibold text-on-surface">
          {match[3]}
        </strong>
      );
    } else if (match[4]) {
      result.push(
        <em key={key} className="italic">
          {match[4]}
        </em>
      );
    }
    key++;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

export default function MarkdownText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const lines = children.split("\n");
  const elements: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let listKey = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc list-outside pl-5 space-y-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  }

  lines.forEach((line, i) => {
    const listMatch = line.match(/^\s*[-*]\s+(.+)/);
    if (listMatch) {
      listItems.push(<li key={i}>{formatInline(listMatch[1])}</li>);
    } else {
      flushList();
      if (line.trim() === "") {
        elements.push(<br key={i} />);
      } else {
        elements.push(
          <span key={i}>
            {formatInline(line)}
            {i < lines.length - 1 && <br />}
          </span>
        );
      }
    }
  });

  flushList();

  return <div className={className}>{elements}</div>;
}
