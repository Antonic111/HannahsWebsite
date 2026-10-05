import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { 
  COURSE_ICONS, 
  DEFAULT_COURSE_ICON, 
  resolveCourseIcon, 
  isSupportedCourseIcon,
  type IconDefinition 
} from '../../utils/iconRegistry';
import styles from './IconPicker.module.css';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'medical', label: 'Medical & Healthcare' },
  { id: 'safety', label: 'Safety & Emergency' },
  { id: 'time', label: 'Renewal & Time' },
  { id: 'certification', label: 'Cert & Training' },
  { id: 'workplace', label: 'Workplace' },
  { id: 'general', label: 'General' },
];

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredIcon, setHoveredIcon] = useState<IconDefinition | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize selected icon name (gracefully fall back to DEFAULT_COURSE_ICON)
  const currentIconName = value && isSupportedCourseIcon(value) ? value : (value || DEFAULT_COURSE_ICON);
  const SelectedIconComponent = resolveCourseIcon(currentIconName);

  // Auto-focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setHoveredIcon(null);
    }
  }, [isOpen]);

  // Handle outside click & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter icons by category and search query
  const filteredIcons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return COURSE_ICONS.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Search query filter (matches name or any tag)
      if (!query) return true;

      const nameMatch = item.name.toLowerCase().includes(query);
      const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(query));

      return nameMatch || tagMatch;
    });
  }, [searchQuery, activeCategory]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
  };

  return (
    <div className={styles.pickerContainer} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <div className={styles.triggerLeft}>
          <div className={styles.iconPreviewBox} aria-hidden="true">
            <SelectedIconComponent size={22} />
          </div>
          <div className={styles.triggerMeta}>
            <span className={styles.triggerLabel}>Selected Icon</span>
            <span className={styles.triggerValue}>
              {currentIconName} {currentIconName === DEFAULT_COURSE_ICON && !value ? '(Default)' : ''}
            </span>
          </div>
        </div>

        <div className={styles.triggerRight}>
          <span>{isOpen ? 'Close' : 'Change Icon'}</span>
          <ChevronDown size={16} className={styles.triggerChevron} />
        </div>
      </button>

      {/* Popover Dropdown Picker */}
      {isOpen && (
        <div className={styles.popover} role="dialog" aria-label="Choose a course icon">
          {/* Header with Search and Category filters */}
          <div className={styles.popoverHeader}>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Search icons (e.g. heart, cpr, shield, timer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search course icons"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className={styles.categoryTabs}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.categoryTabActive : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Icon Grid */}
          <div className={styles.gridScroll}>
            {filteredIcons.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No icons found matching &quot;{searchQuery}&quot;</p>
                <button
                  type="button"
                  className={styles.resetFilterBtn}
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredIcons.map((item) => {
                  const Icon = item.component;
                  const isSelected = item.name === currentIconName;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={`${styles.iconBtn} ${isSelected ? styles.iconBtnActive : ''}`}
                      title={item.name}
                      onClick={() => handleSelect(item.name)}
                      onMouseEnter={() => setHoveredIcon(item)}
                      onMouseLeave={() => setHoveredIcon(null)}
                      aria-label={`Select ${item.name} icon`}
                    >
                      <Icon size={20} />
                      {isSelected && <span className={styles.checkIndicator} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Status Bar with Hover Preview & Name */}
          <div className={styles.popoverFooter}>
            <div className={styles.hoverInfo}>
              {hoveredIcon ? (
                <>
                  <span className={styles.hoverName}>{hoveredIcon.name}</span>
                  <span>({hoveredIcon.tags.slice(0, 3).join(', ')})</span>
                </>
              ) : (
                <span>Click an icon to select &bull; {filteredIcons.length} available</span>
              )}
            </div>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
