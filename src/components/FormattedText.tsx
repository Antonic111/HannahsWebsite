import React from 'react';

/**
 * Parses inline formatting for bold (**text**) and italic (*text*).
 */
export const formatInlineText = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

interface FormattedDescriptionProps {
  content: string;
  className?: string;
}

/**
 * Formats multi-line text supporting:
 * - Bullet points (lines starting with '• ', '- ', or '* ')
 * - Paragraphs with proper line breaks
 * - Inline bold and italics
 */
export const FormattedDescription: React.FC<FormattedDescriptionProps> = ({ content, className }) => {
  if (!content) return null;

  const rawLines = content.split('\n');

  // Strip empty lines from the very start and end to avoid unnatural outer padding
  let start = 0;
  while (start < rawLines.length && rawLines[start].trim().length === 0) {
    start++;
  }
  let end = rawLines.length - 1;
  while (end >= start && rawLines[end].trim().length === 0) {
    end--;
  }

  if (start > end) return null;

  const lines = rawLines.slice(start, end + 1);
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (keyPrefix: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${keyPrefix}`} style={{ margin: '0.25rem 0', paddingLeft: '1.15rem', listStyleType: 'disc' }}>
          {currentList.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.15rem', lineHeight: '1.4' }}>
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');

    if (isBullet) {
      const cleanItem = trimmed.replace(/^[•\-*]\s*/, '');
      currentList.push(cleanItem);
    } else {
      flushList(index);
      if (trimmed.length > 0) {
        elements.push(
          <p key={`p-${index}`} style={{ margin: '0.2rem 0', lineHeight: '1.45' }}>
            {formatInlineText(trimmed)}
          </p>
        );
      } else {
        // Visible empty line spacer created by pressing Enter
        elements.push(
          <div key={`spacer-${index}`} style={{ height: '0.85rem' }} aria-hidden="true" />
        );
      }
    }
  });

  flushList(lines.length);

  return <div className={className}>{elements}</div>;
};
