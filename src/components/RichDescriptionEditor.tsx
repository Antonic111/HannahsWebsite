import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  Palette,
  Highlighter,
  List,
  ListOrdered,
  Minus,
  Sparkles,
  Eraser,
  HelpCircle,
  Eye,
  Columns,
  Edit3,
  Quote,
  ChevronDown,
  X,
} from 'lucide-react';
import { FormattedDescription, stripFormatting } from './FormattedText';
import styles from './RichDescriptionEditor.module.css';

interface RichDescriptionEditorProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  helpText?: string;
}

const PRESET_COLORS = [
  { name: 'Navy Brand', hex: '#0a4275' },
  { name: 'Crimson Red', hex: '#e63946' },
  { name: 'Dark Slate', hex: '#1e293b' },
  { name: 'Muted Gray', hex: '#64748b' },
  { name: 'Royal Blue', hex: '#1d4ed8' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Amber Gold', hex: '#d97706' },
  { name: 'Violet Purple', hex: '#7c3aed' },
  { name: 'Deep Teal', hex: '#0d9488' },
  { name: 'Rose Accent', hex: '#e11d48' },
];

const PRESET_SIZES = [
  { label: 'Small', tag: 'sm', desc: '88% size (notes, footnotes)', preview: '0.88rem' },
  { label: 'Normal', tag: 'base', desc: '100% default body text', preview: '1rem' },
  { label: 'Medium-Large', tag: 'lg', desc: '120% size (highlights)', preview: '1.2rem' },
  { label: 'Large', tag: 'xl', desc: '145% size (section titles)', preview: '1.45rem' },
  { label: 'Headline / Big', tag: '2xl', desc: '175% size (key callout)', preview: '1.75rem' },
];

export const RichDescriptionEditor: React.FC<RichDescriptionEditorProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = 'Write here...',
  rows = 5,
  required = false,
  helpText,
}) => {
  const [viewMode, setViewMode] = useState<'write' | 'split' | 'preview'>('write');
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showComboMenu, setShowComboMenu] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const [customColor, setCustomColor] = useState('#e63946');
  const [customHex, setCustomHex] = useState('#e63946');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const highlightMenuRef = useRef<HTMLDivElement>(null);
  const comboMenuRef = useRef<HTMLDivElement>(null);

  // Close popups when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (colorMenuRef.current && !colorMenuRef.current.contains(target)) {
        setShowColorMenu(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(target)) {
        setShowSizeMenu(false);
      }
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(target)) {
        setShowHighlightMenu(false);
      }
      if (comboMenuRef.current && !comboMenuRef.current.contains(target)) {
        setShowComboMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const closeAllMenus = () => {
    setShowColorMenu(false);
    setShowSizeMenu(false);
    setShowHighlightMenu(false);
    setShowComboMenu(false);
  };

  /**
   * Applies formatting to the selected text, maintaining selection so multiple
   * formats (color, size, bold, italic) can be applied in succession.
   */
  const applyFormat = (type: string, param?: string) => {
    closeAllMenus();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || '';
    const selected = text.substring(start, end);

    const hasSelection = selected.length > 0;
    const targetText = hasSelection
      ? selected
      : type === 'bold'
      ? 'bold text'
      : type === 'italic'
      ? 'italic text'
      : type === 'underline'
      ? 'underlined text'
      : type === 'strike'
      ? 'strikethrough text'
      : type === 'color'
      ? 'colored text'
      : type === 'size'
      ? 'sized text'
      : type === 'bg'
      ? 'highlighted text'
      : type === 'badge'
      ? 'BADGE'
      : type === 'callout'
      ? 'Important course notice or requirement'
      : type === 'combo-subheading'
      ? 'Course Heading'
      : type === 'combo-alert'
      ? 'Important Notice'
      : type === 'combo-cert'
      ? 'Official Certification'
      : 'text';

    let replacement = '';

    switch (type) {
      case 'bold': {
        // Toggle off if already wrapped in **...**
        if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
          replacement = selected.slice(2, -2);
        } else {
          replacement = `**${targetText}**`;
        }
        break;
      }
      case 'italic': {
        // Toggle off if wrapped in *...* (and not bold **)
        if (selected.startsWith('*') && selected.endsWith('*') && !selected.startsWith('**') && selected.length >= 2) {
          replacement = selected.slice(1, -1);
        } else {
          replacement = `*${targetText}*`;
        }
        break;
      }
      case 'underline': {
        if (selected.startsWith('[u]') && selected.endsWith('[/u]')) {
          replacement = selected.slice(3, -4);
        } else {
          replacement = `[u]${targetText}[/u]`;
        }
        break;
      }
      case 'strike': {
        if (selected.startsWith('~~') && selected.endsWith('~~')) {
          replacement = selected.slice(2, -2);
        } else {
          replacement = `~~${targetText}~~`;
        }
        break;
      }
      case 'color': {
        const color = param || '#e63946';
        // If selected is already wrapped in [color=...]...[/color], cleanly replace the color parameter!
        const colorRegex = /^\[color=[^\]]+\]([\s\S]*?)\[\/color\]$/i;
        const colorMatch = colorRegex.exec(selected);
        if (colorMatch) {
          replacement = `[color=${color}]${colorMatch[1]}[/color]`;
        } else {
          replacement = `[color=${color}]${targetText}[/color]`;
        }
        break;
      }
      case 'remove-color': {
        replacement = selected.replace(/^\[color=[^\]]+\]([\s\S]*?)\[\/color\]$/i, '$1');
        break;
      }
      case 'size': {
        const size = param || 'lg';
        if (size === 'base') {
          // If setting to normal base size, strip existing size tag
          replacement = selected.replace(/^\[size=[^\]]+\]([\s\S]*?)\[\/size\]$/i, '$1');
        } else {
          // If already wrapped in [size=...]...[/size], cleanly replace the size parameter!
          const sizeRegex = /^\[size=[^\]]+\]([\s\S]*?)\[\/size\]$/i;
          const sizeMatch = sizeRegex.exec(selected);
          if (sizeMatch) {
            replacement = `[size=${size}]${sizeMatch[1]}[/size]`;
          } else {
            replacement = `[size=${size}]${targetText}[/size]`;
          }
        }
        break;
      }
      case 'bg': {
        const bg = param || '#fef08a';
        replacement = `[bg=${bg}]${targetText}[/bg]`;
        break;
      }
      case 'badge': {
        const badgeColor = param || 'red';
        replacement = `[badge=${badgeColor}]${targetText}[/badge]`;
        break;
      }
      case 'bullet': {
        if (hasSelection) {
          replacement = selected
            .split('\n')
            .map(line => (/^[•\-*]\s+/.test(line.trim()) ? line : `• ${line}`))
            .join('\n');
        } else {
          const needsNewline = start > 0 && text[start - 1] !== '\n';
          replacement = `${needsNewline ? '\n' : ''}• `;
        }
        break;
      }
      case 'numbered': {
        if (hasSelection) {
          replacement = selected
            .split('\n')
            .map((line, i) => (/^\d+\.\s+/.test(line.trim()) ? line : `${i + 1}. ${line}`))
            .join('\n');
        } else {
          const needsNewline = start > 0 && text[start - 1] !== '\n';
          replacement = `${needsNewline ? '\n' : ''}1. `;
        }
        break;
      }
      case 'callout': {
        if (hasSelection) {
          replacement = selected
            .split('\n')
            .map(line => (line.trim().startsWith('>') ? line : `> ${line}`))
            .join('\n');
        } else {
          const needsNewline = start > 0 && text[start - 1] !== '\n';
          replacement = `${needsNewline ? '\n' : ''}> **Note:** ${targetText}`;
        }
        break;
      }
      case 'divider': {
        const needsNewline = start > 0 && text[start - 1] !== '\n';
        replacement = `${needsNewline ? '\n\n' : '\n'}---\n\n`;
        break;
      }
      case 'combo-subheading': {
        // Large + Bold + Brand Navy (#0a4275)
        replacement = `[size=lg][color=#0a4275]**${targetText}**[/color][/size]`;
        break;
      }
      case 'combo-alert': {
        // Bold + Crimson Red (#e63946)
        replacement = `[color=#e63946]**${targetText}**[/color]`;
        break;
      }
      case 'combo-cert': {
        // Bold + Emerald Green (#059669)
        replacement = `[color=#059669]**${targetText}**[/color]`;
        break;
      }
      case 'clear': {
        replacement = stripFormatting(selected);
        break;
      }
      default:
        return;
    }

    const updatedText = text.substring(0, start) + replacement + text.substring(end);
    onChange(updatedText);

    // Keep the replaced text selected so the user can immediately chain more formats!
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        applyFormat('bold');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        applyFormat('italic');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        applyFormat('underline');
      }
    }
  };

  const charCount = value?.length || 0;
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className={styles.editorContainer}>
      {/* Header bar */}
      <div className={styles.editorHeader}>
        <div className={styles.labelGroup}>
          <label htmlFor={id} className={styles.editorLabel}>
            {label}
            {required && <span className={styles.requiredAsterisk}>*</span>}
          </label>
          <span className={styles.charBadge}>
            {wordCount} words • {charCount} chars
          </span>
        </div>

        <div className={styles.viewModes}>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${viewMode === 'write' ? styles.viewModeBtnActive : ''}`}
            onClick={() => setViewMode('write')}
            title="Write mode"
          >
            <Edit3 size={13} />
            <span>Write</span>
          </button>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${viewMode === 'split' ? styles.viewModeBtnActive : ''}`}
            onClick={() => setViewMode('split')}
            title="Split view: Editor and real-time live preview side-by-side"
          >
            <Columns size={13} />
            <span>Split View</span>
          </button>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${viewMode === 'preview' ? styles.viewModeBtnActive : ''}`}
            onClick={() => setViewMode('preview')}
            title="Full preview mode"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Formatting Toolbar (shown in write and split modes) */}
      {viewMode !== 'preview' && (
        <div className={styles.toolbar}>
          {/* Text Style Group */}
          <div className={styles.toolGroup}>
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
              onClick={() => applyFormat('bold')}
              title="Bold (**text**) — Ctrl+B"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
              onClick={() => applyFormat('italic')}
              title="Italic (*text*) — Ctrl+I"
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
              onClick={() => applyFormat('underline')}
              title="Underline ([u]text[/u]) — Ctrl+U"
            >
              <Underline size={14} />
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
              onClick={() => applyFormat('strike')}
              title="Strikethrough (~~text~~)"
            >
              <Strikethrough size={14} />
            </button>
          </div>

          <div className={styles.toolDivider} />

          {/* Font Size Dropdown */}
          <div className={styles.popoverWrapper} ref={sizeMenuRef}>
            <button
              type="button"
              className={`${styles.toolBtn} ${showSizeMenu ? styles.toolBtnActive : ''}`}
              onClick={() => {
                setShowSizeMenu(!showSizeMenu);
                setShowColorMenu(false);
                setShowHighlightMenu(false);
                setShowComboMenu(false);
              }}
              title="Change font size"
            >
              <Type size={14} />
              <span>Size</span>
              <ChevronDown size={11} />
            </button>

            {showSizeMenu && (
              <div className={styles.popoverMenu} style={{ minWidth: '200px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', padding: '0.2rem 0.6rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                  Select Font Size
                </div>
                {PRESET_SIZES.map(s => (
                  <button
                    key={s.tag}
                    type="button"
                    className={styles.sizeMenuItem}
                    onClick={() => applyFormat('size', s.tag)}
                  >
                    <div>
                      <div style={{ fontSize: s.preview, fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.toolDivider} />

          {/* Color Picker Dropdown */}
          <div className={styles.popoverWrapper} ref={colorMenuRef}>
            <button
              type="button"
              className={`${styles.toolBtn} ${showColorMenu ? styles.toolBtnActive : ''}`}
              onClick={() => {
                setShowColorMenu(!showColorMenu);
                setShowSizeMenu(false);
                setShowHighlightMenu(false);
                setShowComboMenu(false);
              }}
              title="Change text color"
            >
              <Palette size={14} />
              <span
                className={styles.colorSwatchIndicator}
                style={{ backgroundColor: customHex }}
              />
              <span>Color</span>
              <ChevronDown size={11} />
            </button>

            {showColorMenu && (
              <div className={styles.popoverMenu} style={{ minWidth: '220px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '0.45rem' }}>
                  Theme Colors
                </div>
                <div className={styles.colorGrid}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      className={styles.colorDot}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => applyFormat('color', c.hex)}
                      title={`${c.name} (${c.hex})`}
                    />
                  ))}
                </div>

                <div className={styles.customColorRow}>
                  <input
                    type="color"
                    className={styles.customColorInput}
                    value={customColor}
                    onChange={e => {
                      setCustomColor(e.target.value);
                      setCustomHex(e.target.value);
                    }}
                  />
                  <input
                    type="text"
                    className={styles.customHexInput}
                    value={customHex}
                    onChange={e => setCustomHex(e.target.value)}
                    placeholder="#hex"
                  />
                  <button
                    type="button"
                    className={styles.customApplyBtn}
                    onClick={() => applyFormat('color', customHex)}
                  >
                    Apply
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.resetColorBtn}
                  onClick={() => applyFormat('remove-color')}
                >
                  Reset to Default Color
                </button>
              </div>
            )}
          </div>

          {/* Highlight & Badges */}
          <div className={styles.popoverWrapper} ref={highlightMenuRef}>
            <button
              type="button"
              className={`${styles.toolBtn} ${showHighlightMenu ? styles.toolBtnActive : ''}`}
              onClick={() => {
                setShowHighlightMenu(!showHighlightMenu);
                setShowColorMenu(false);
                setShowSizeMenu(false);
                setShowComboMenu(false);
              }}
              title="Highlighting & Badges"
            >
              <Highlighter size={14} />
              <span>Highlight</span>
              <ChevronDown size={11} />
            </button>

            {showHighlightMenu && (
              <div className={styles.popoverMenu} style={{ minWidth: '190px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                  Text Highlights
                </div>
                <button
                  type="button"
                  className={styles.sizeMenuItem}
                  onClick={() => applyFormat('bg', '#fef08a')}
                >
                  <mark style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                    Warm Yellow
                  </mark>
                </button>
                <button
                  type="button"
                  className={styles.sizeMenuItem}
                  onClick={() => applyFormat('bg', '#bbf7d0')}
                >
                  <mark style={{ backgroundColor: '#bbf7d0', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                    Soft Green
                  </mark>
                </button>
                <button
                  type="button"
                  className={styles.sizeMenuItem}
                  onClick={() => applyFormat('bg', '#bfdbfe')}
                >
                  <mark style={{ backgroundColor: '#bfdbfe', color: '#1e40af', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                    Soft Blue
                  </mark>
                </button>

                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0.5rem 0 0.35rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                  Pill Badges
                </div>
                <button
                  type="button"
                  className={styles.sizeMenuItem}
                  onClick={() => applyFormat('badge', 'red')}
                >
                  <span style={{ backgroundColor: '#e63946', color: '#fff', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    Red Badge
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.sizeMenuItem}
                  onClick={() => applyFormat('badge', 'blue')}
                >
                  <span style={{ backgroundColor: '#0a4275', color: '#fff', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    Navy Badge
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.sizeMenuItem}
                  onClick={() => applyFormat('badge', 'green')}
                >
                  <span style={{ backgroundColor: '#059669', color: '#fff', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    Green Badge
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className={styles.toolDivider} />

          {/* Lists & Callout Group */}
          <div className={styles.toolGroup}>
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
              onClick={() => applyFormat('bullet')}
              title="Bullet List (• item)"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
              onClick={() => applyFormat('numbered')}
              title="Numbered List (1. item)"
            >
              <ListOrdered size={14} />
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
              onClick={() => applyFormat('callout')}
              title="Callout Box (> Note)"
            >
              <Quote size={14} />
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
              onClick={() => applyFormat('divider')}
              title="Horizontal Divider (---)"
            >
              <Minus size={14} />
            </button>
          </div>

          <div className={styles.toolDivider} />

          {/* Combo Presets Menu */}
          <div className={styles.popoverWrapper} ref={comboMenuRef}>
            <button
              type="button"
              className={`${styles.toolBtn} ${showComboMenu ? styles.toolBtnActive : ''}`}
              onClick={() => {
                setShowComboMenu(!showComboMenu);
                setShowColorMenu(false);
                setShowSizeMenu(false);
                setShowHighlightMenu(false);
              }}
              title="1-Click Combined Styles (Color + Size + Bold at once)"
            >
              <Sparkles size={14} color="#0a4275" />
              <span>Combos</span>
              <ChevronDown size={11} />
            </button>

            {showComboMenu && (
              <div className={styles.popoverMenu} style={{ minWidth: '220px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', padding: '0.2rem 0.6rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                  1-Click Multi-Styles
                </div>
                <button
                  type="button"
                  className={styles.comboMenuItem}
                  onClick={() => applyFormat('combo-subheading')}
                >
                  <span className={styles.comboTitle} style={{ color: '#0a4275' }}>
                    Section Heading
                  </span>
                  <span className={styles.comboDesc}>Large + Bold + Brand Navy</span>
                </button>
                <button
                  type="button"
                  className={styles.comboMenuItem}
                  onClick={() => applyFormat('combo-alert')}
                >
                  <span className={styles.comboTitle} style={{ color: '#e63946' }}>
                    Important Alert
                  </span>
                  <span className={styles.comboDesc}>Bold + Crimson Red</span>
                </button>
                <button
                  type="button"
                  className={styles.comboMenuItem}
                  onClick={() => applyFormat('combo-cert')}
                >
                  <span className={styles.comboTitle} style={{ color: '#059669' }}>
                    Official Certification
                  </span>
                  <span className={styles.comboDesc}>Bold + Emerald Green</span>
                </button>
              </div>
            )}
          </div>

          {/* Clear Formatting */}
          <button
            type="button"
            className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
            onClick={() => applyFormat('clear')}
            title="Clear all formatting from selection"
          >
            <Eraser size={14} />
          </button>

          {/* Guide / Cheat sheet */}
          <button
            type="button"
            className={`${styles.toolBtn} ${styles.iconOnlyBtn}`}
            style={{ marginLeft: 'auto' }}
            onClick={() => setShowGuideModal(true)}
            title="Formatting Guide & Cheat Sheet"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      )}

      {/* Editor Body Area */}
      <div className={styles.editorBody}>
        {viewMode === 'write' && (
          <div>
            <textarea
              ref={textareaRef}
              id={id}
              name={name}
              className={styles.textarea}
              rows={rows}
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              required={required}
            />

            {/* Quick expandable preview strip in write mode */}
            <div
              className={styles.quickPreviewToggle}
              onClick={() => setShowQuickPreview(!showQuickPreview)}
            >
              <span>{showQuickPreview ? '▼ Hide Live Preview' : '▶ Show Live Preview (Instant)'}</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Real-time site view</span>
            </div>

            {showQuickPreview && (
              <div className={styles.quickPreviewContent}>
                {value ? (
                  <FormattedDescription content={value} />
                ) : (
                  <span className={styles.emptyPreviewText}>Nothing typed yet...</span>
                )}
              </div>
            )}
          </div>
        )}

        {viewMode === 'split' && (
          <div className={styles.splitViewGrid}>
            <div className={styles.splitViewTextareaCol}>
              <textarea
                ref={textareaRef}
                id={id}
                name={name}
                className={styles.textarea}
                rows={Math.max(rows, 9)}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                required={required}
                style={{ height: '100%', minHeight: '220px' }}
              />
            </div>
            <div className={styles.previewPane}>
              <div className={styles.splitPreviewHeader}>
                <span>Live Website Render</span>
                <span className={styles.splitPreviewBadge}>Real-time Sync</span>
              </div>
              <div style={{ paddingTop: '0.75rem' }}>
                {value ? (
                  <FormattedDescription content={value} />
                ) : (
                  <span className={styles.emptyPreviewText}>Type on the left to see live formatting...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'preview' && (
          <div className={styles.previewPane} style={{ minHeight: '160px' }}>
            {value ? (
              <FormattedDescription content={value} />
            ) : (
              <span className={styles.emptyPreviewText}>No text entered yet.</span>
            )}
          </div>
        )}
      </div>

      {helpText && (
        <div style={{ padding: '0.35rem 0.85rem', fontSize: '0.72rem', color: '#64748b', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          {helpText}
        </div>
      )}

      {/* Formatting Cheat-sheet Modal */}
      {showGuideModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowGuideModal(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Formatting Guide & Cheat Sheet</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowGuideModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
                You can apply <strong>color, font size, bold, and italic all at the same time</strong>! Just select the text and click the toolbar buttons, or type the tags directly:
              </p>

              <table className={styles.guideTable}>
                <thead>
                  <tr>
                    <th>Effect</th>
                    <th>Syntax</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Bold</strong></td>
                    <td><code>**text**</code></td>
                    <td><strong>Bold</strong></td>
                  </tr>
                  <tr>
                    <td><em>Italic</em></td>
                    <td><code>*text*</code></td>
                    <td><em>Italic</em></td>
                  </tr>
                  <tr>
                    <td><strong><em>Bold & Italic</em></strong></td>
                    <td><code>***text***</code></td>
                    <td><strong><em>Both</em></strong></td>
                  </tr>
                  <tr>
                    <td><u>Underline</u></td>
                    <td><code>[u]text[/u]</code></td>
                    <td><u>Underline</u></td>
                  </tr>
                  <tr>
                    <td>Color</td>
                    <td><code>[color=#e63946]text[/color]</code></td>
                    <td><span style={{ color: '#e63946', fontWeight: 600 }}>Crimson Text</span></td>
                  </tr>
                  <tr>
                    <td>Font Size</td>
                    <td><code>[size=lg]text[/size]</code></td>
                    <td><span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Large Text</span></td>
                  </tr>
                  <tr>
                    <td><strong>Combined All-In-One</strong></td>
                    <td><code>[color=#e63946][size=lg]***text***[/size][/color]</code></td>
                    <td>
                      <span style={{ color: '#e63946', fontSize: '1.2rem', fontWeight: 700 }}>
                        <em>Bold, Italic, Red & Large!</em>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Highlight</td>
                    <td><code>[bg=#fef08a]text[/bg]</code></td>
                    <td><mark style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>Yellow</mark></td>
                  </tr>
                  <tr>
                    <td>Pill Badge</td>
                    <td><code>[badge=red]TAG[/badge]</code></td>
                    <td><span style={{ backgroundColor: '#e63946', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>TAG</span></td>
                  </tr>
                  <tr>
                    <td>Callout Note</td>
                    <td><code>&gt; **Note:** Message</code></td>
                    <td>Callout box with colored accent bar</td>
                  </tr>
                  <tr>
                    <td>Bullet List</td>
                    <td><code>• Item 1</code></td>
                    <td>Bullet point item</td>
                  </tr>
                  <tr>
                    <td>Numbered List</td>
                    <td><code>1. Item 1</code></td>
                    <td>Numbered list item</td>
                  </tr>
                  <tr>
                    <td>Divider</td>
                    <td><code>---</code></td>
                    <td>Horizontal separator line</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
