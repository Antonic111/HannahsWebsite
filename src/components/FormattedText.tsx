import React from 'react';

export interface FormattedDescriptionProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Resolves named and theme colors to valid CSS color strings.
 */
export const resolveColor = (val: string): string => {
  if (!val) return 'inherit';
  const clean = val.trim().toLowerCase();
  const colorMap: Record<string, string> = {
    primary: 'var(--color-primary, #0a4275)',
    navy: '#0a4275',
    secondary: 'var(--color-secondary, #e63946)',
    red: '#e63946',
    crimson: '#c8102e',
    blue: '#1d4ed8',
    royalblue: '#1d4ed8',
    green: '#059669',
    emerald: '#059669',
    amber: '#d97706',
    orange: '#ea580c',
    yellow: '#ca8a04',
    purple: '#7c3aed',
    violet: '#7c3aed',
    dark: '#1e293b',
    charcoal: '#1e293b',
    black: '#0f172a',
    gray: '#64748b',
    slate: '#64748b',
    muted: 'var(--color-text-muted, #457b9d)',
    teal: '#0d9488',
    rose: '#e11d48',
  };

  if (colorMap[clean]) return colorMap[clean];
  return val.trim();
};

/**
 * Resolves font size tokens to readable CSS font-size values.
 */
export const resolveSize = (val: string): string => {
  if (!val) return 'inherit';
  const clean = val.trim().toLowerCase();
  const sizeMap: Record<string, string> = {
    xs: '0.78rem',
    sm: '0.88rem',
    small: '0.88rem',
    base: '1rem',
    md: '1rem',
    normal: '1rem',
    lg: '1.2rem',
    large: '1.2rem',
    xl: '1.45rem',
    xlarge: '1.45rem',
    '2xl': '1.75rem',
    '3xl': '2.1rem',
    title: '1.5rem',
    heading: '1.75rem',
  };

  if (sizeMap[clean]) return sizeMap[clean];
  if (/^\d+(\.\d+)?(px|rem|em|pt|%)?$/.test(clean)) {
    return /^\d+(\.\d+)?$/.test(clean) ? `${clean}px` : clean;
  }
  return val.trim();
};

/**
 * Strips all formatting tags from a text string.
 */
export const stripFormatting = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\[\/?(?:color|size|bg|highlight|badge|b|i|u|s|callout|style)(?:=[^\]]*)?\]/gi, '')
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/___(.*?)___/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^[•\-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '');
};

/**
 * Finds the matching closing BBCode tag taking nested instances into account.
 */
function findClosingBBCodeTag(
  str: string,
  tag: string,
  startContentPos: number
): { contentEnd: number; closeEnd: number } | null {
  let depth = 1;
  const regex = new RegExp(`\\[\\s*(${tag})(?:[=\\s][^\\]]*)?\\]|\\[\\/\\s*${tag}\\s*\\]`, 'gi');
  regex.lastIndex = startContentPos;

  let m: RegExpExecArray | null;
  while ((m = regex.exec(str)) !== null) {
    if (m[0].startsWith('[/')) {
      depth--;
      if (depth === 0) {
        return {
          contentEnd: m.index,
          closeEnd: m.index + m[0].length,
        };
      }
    } else {
      depth++;
    }
  }
  return null;
}

interface ASTNode {
  type: 'text' | 'bbcode' | 'bold_italic' | 'bold' | 'italic' | 'strike';
  tag?: string;
  param?: string;
  content?: string;
  children?: (ASTNode | string)[];
}

/**
 * Parses inline string into an abstract syntax tree of formatting nodes.
 */
function parseInlineTree(text: string): (ASTNode | string)[] {
  const nodes: (ASTNode | string)[] = [];
  let index = 0;

  while (index < text.length) {
    const sub = text.slice(index);
    let earliest: {
      type: 'bbcode' | 'bold_italic' | 'bold' | 'italic' | 'strike';
      start: number;
      end: number;
      content: string;
      tag?: string;
      param?: string;
    } | null = null;

    // 1. BBCode tags: [tag(=param)?] ... [/tag]
    const bbMatch = /\[(color|size|bg|highlight|badge|b|i|u|s|callout)(?:[=\s]([^\]]*))?\]/i.exec(sub);
    if (bbMatch) {
      const tag = bbMatch[1].toLowerCase();
      const rawParam = (bbMatch[2] || '').trim();
      const param = rawParam.replace(/^['"]|['"]$/g, '');
      const openStart = index + bbMatch.index;
      const contentStart = openStart + bbMatch[0].length;
      const closing = findClosingBBCodeTag(text, tag, contentStart);
      if (closing) {
        earliest = {
          type: 'bbcode',
          tag,
          param,
          start: openStart,
          content: text.slice(contentStart, closing.contentEnd),
          end: closing.closeEnd,
        };
      }
    }

    // 2. Bold+Italic: ***text*** or ___text___
    const biMatch = /(?:\*\*\*([^*\n]+?)\*\*\*|___([^_\n]+?)___)/.exec(sub);
    if (biMatch && (!earliest || index + biMatch.index < earliest.start)) {
      earliest = {
        type: 'bold_italic',
        start: index + biMatch.index,
        content: biMatch[1] || biMatch[2],
        end: index + biMatch.index + biMatch[0].length,
      };
    }

    // 3. Bold: **text** or __text__
    const boldMatch = /(?:\*\*([^*\n]+?)\*\*|__([^_\n]+?)__)/.exec(sub);
    if (boldMatch && (!earliest || index + boldMatch.index < earliest.start)) {
      earliest = {
        type: 'bold',
        start: index + boldMatch.index,
        content: boldMatch[1] || boldMatch[2],
        end: index + boldMatch.index + boldMatch[0].length,
      };
    }

    // 4. Strikethrough: ~~text~~
    const strikeMatch = /~~([^~\n]+?)~~/.exec(sub);
    if (strikeMatch && (!earliest || index + strikeMatch.index < earliest.start)) {
      earliest = {
        type: 'strike',
        start: index + strikeMatch.index,
        content: strikeMatch[1],
        end: index + strikeMatch.index + strikeMatch[0].length,
      };
    }

    // 5. Italic: *text* or _text_
    const italicMatch = /(?:(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)([^_\n]+?)(?<!_)_(?!_))/.exec(sub);
    if (italicMatch && (!earliest || index + italicMatch.index < earliest.start)) {
      earliest = {
        type: 'italic',
        start: index + italicMatch.index,
        content: italicMatch[1] || italicMatch[2],
        end: index + italicMatch.index + italicMatch[0].length,
      };
    }

    if (!earliest) {
      nodes.push(text.slice(index));
      break;
    }

    if (earliest.start > index) {
      nodes.push(text.slice(index, earliest.start));
    }

    nodes.push({
      type: earliest.type,
      tag: earliest.tag,
      param: earliest.param,
      children: parseInlineTree(earliest.content),
    });

    index = earliest.end;
  }

  return nodes;
}

/**
 * Renders an AST of inline nodes to React nodes with complete support for
 * combined colors, font sizes, bold, italic, underline, highlights, and badges.
 */
function renderNodesToReact(nodes: (ASTNode | string)[], keyPrefix: string): React.ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}-${i}`;

    if (typeof node === 'string') {
      return <React.Fragment key={key}>{node}</React.Fragment>;
    }

    const children = node.children ? renderNodesToReact(node.children, key) : null;

    if (node.type === 'bold_italic') {
      return (
        <strong key={key} style={{ fontWeight: 700 }}>
          <em>{children}</em>
        </strong>
      );
    }

    if (node.type === 'bold') {
      return (
        <strong key={key} style={{ fontWeight: 700 }}>
          {children}
        </strong>
      );
    }

    if (node.type === 'italic') {
      return <em key={key}>{children}</em>;
    }

    if (node.type === 'strike') {
      return <s key={key}>{children}</s>;
    }

    if (node.type === 'bbcode') {
      const tag = node.tag?.toLowerCase();
      const param = node.param || '';

      switch (tag) {
        case 'color': {
          const colorVal = resolveColor(param);
          return (
            <span key={key} style={{ color: colorVal }}>
              {children}
            </span>
          );
        }
        case 'size': {
          const sizeVal = resolveSize(param);
          return (
            <span key={key} style={{ fontSize: sizeVal, lineHeight: '1.3' }}>
              {children}
            </span>
          );
        }
        case 'bg':
        case 'highlight': {
          const bgVal = resolveColor(param || '#fef08a');
          const isYellow = bgVal.toLowerCase().includes('fef08a') || bgVal.toLowerCase().includes('yellow');
          const textColor = isYellow ? '#854d0e' : '#ffffff';
          return (
            <mark
              key={key}
              style={{
                backgroundColor: bgVal,
                color: textColor,
                padding: '0.12em 0.35em',
                borderRadius: '4px',
                fontWeight: 500,
              }}
            >
              {children}
            </mark>
          );
        }
        case 'badge': {
          const badgeType = (param || 'red').toLowerCase();
          let bg = '#e63946';
          let textColor = '#ffffff';

          if (badgeType === 'blue' || badgeType === 'primary') {
            bg = '#0a4275';
          } else if (badgeType === 'green' || badgeType === 'emerald') {
            bg = '#059669';
          } else if (badgeType === 'amber' || badgeType === 'orange') {
            bg = '#d97706';
          } else if (badgeType.startsWith('#')) {
            bg = badgeType;
          }

          return (
            <span
              key={key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                backgroundColor: bg,
                color: textColor,
                verticalAlign: 'baseline',
                margin: '0 0.25rem',
                lineHeight: '1.2',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {children}
            </span>
          );
        }
        case 'b':
          return (
            <strong key={key} style={{ fontWeight: 700 }}>
              {children}
            </strong>
          );
        case 'i':
          return <em key={key}>{children}</em>;
        case 'u':
          return (
            <u key={key} style={{ textDecoration: 'underline' }}>
              {children}
            </u>
          );
        case 's':
          return <s key={key}>{children}</s>;
        case 'callout':
          return (
            <div
              key={key}
              style={{
                margin: '0.6rem 0',
                padding: '0.65rem 0.95rem',
                backgroundColor: '#f0f7ff',
                borderLeft: '4px solid var(--color-primary, #0a4275)',
                borderRadius: '0 6px 6px 0',
                color: '#1e293b',
                fontSize: '0.95em',
                lineHeight: '1.5',
              }}
            >
              {children}
            </div>
          );
        default:
          return <span key={key}>{children}</span>;
      }
    }

    return <React.Fragment key={key}>{children}</React.Fragment>;
  });
}

/**
 * Public function to parse inline formatted text into React nodes.
 * Fully supports combinations: color, size, bold, italic, underline, highlight at the same time.
 */
export const formatInlineText = (text: string): React.ReactNode => {
  if (!text) return null;
  const tree = parseInlineTree(text);
  const elements = renderNodesToReact(tree, 'root');
  return elements.length === 1 ? elements[0] : elements;
};

/**
 * Formats multi-line text supporting:
 * - Bullet points (lines starting with '• ', '- ', or '* ')
 * - Numbered lists (lines starting with '1. ', '2. ', etc.)
 * - Callout blocks (lines starting with '> ')
 * - Divider lines (lines containing '---' or '***')
 * - Paragraphs with proper line breaks
 * - Inline formatting with combined color, size, bold, italic, badges, etc.
 */
export const FormattedDescription: React.FC<FormattedDescriptionProps> = ({ content, className, style }) => {
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
  let currentBulletList: string[] = [];
  let currentNumList: string[] = [];

  const flushBulletList = (keyPrefix: number) => {
    if (currentBulletList.length > 0) {
      elements.push(
        <ul
          key={`ul-${keyPrefix}`}
          style={{
            margin: '0.4rem 0',
            paddingLeft: '1.35rem',
            listStyleType: 'disc',
          }}
        >
          {currentBulletList.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.25rem', lineHeight: '1.5' }}>
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );
      currentBulletList = [];
    }
  };

  const flushNumList = (keyPrefix: number) => {
    if (currentNumList.length > 0) {
      elements.push(
        <ol
          key={`ol-${keyPrefix}`}
          style={{
            margin: '0.4rem 0',
            paddingLeft: '1.35rem',
          }}
        >
          {currentNumList.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.25rem', lineHeight: '1.5' }}>
              {formatInlineText(item)}
            </li>
          ))}
        </ol>
      );
      currentNumList = [];
    }
  };

  const flushAllLists = (keyPrefix: number) => {
    flushBulletList(keyPrefix);
    flushNumList(keyPrefix);
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for divider
    if (trimmed === '---' || trimmed === '***') {
      flushAllLists(index);
      elements.push(
        <hr
          key={`hr-${index}`}
          style={{
            border: 'none',
            borderTop: '1px solid #e2e8f0',
            margin: '0.85rem 0',
          }}
        />
      );
      return;
    }

    // Check for callout line: '> message'
    if (trimmed.startsWith('>')) {
      flushAllLists(index);
      const calloutText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div
          key={`callout-${index}`}
          style={{
            margin: '0.55rem 0',
            padding: '0.65rem 0.95rem',
            backgroundColor: '#f8fafc',
            borderLeft: '4px solid var(--color-secondary, #e63946)',
            borderRadius: '0 6px 6px 0',
            fontSize: '0.95em',
            lineHeight: '1.5',
            color: 'var(--color-text-main, #1d3557)',
          }}
        >
          {formatInlineText(calloutText)}
        </div>
      );
      return;
    }

    // Check for bullet list item: •, -, or *
    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || /^\*\s+/.test(trimmed);
    if (isBullet) {
      flushNumList(index);
      const cleanItem = trimmed.replace(/^[•\-*]\s*/, '');
      currentBulletList.push(cleanItem);
      return;
    }

    // Check for numbered list item: 1., 2., etc.
    const numMatch = /^\d+\.\s+(.*)/.exec(trimmed);
    if (numMatch) {
      flushBulletList(index);
      currentNumList.push(numMatch[1]);
      return;
    }

    // Regular line / paragraph
    flushAllLists(index);
    if (trimmed.length > 0) {
      elements.push(
        <p key={`p-${index}`} style={{ margin: '0.35rem 0', lineHeight: '1.55' }}>
          {formatInlineText(trimmed)}
        </p>
      );
    } else {
      // Empty line spacer
      elements.push(
        <div key={`spacer-${index}`} style={{ height: '0.85rem' }} aria-hidden="true" />
      );
    }
  });

  flushAllLists(lines.length);

  return (
    <div className={className} style={style}>
      {elements}
    </div>
  );
};
