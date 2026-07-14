import type { IconName } from '@ghds/icons';
import { tokens } from '@ghds/tokens';
import { type CSSProperties, useState } from 'react';
import { cssVars } from '../lib/cssVars.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';

/** A single navigable entry in a {@link Sidebar}. */
export interface SidebarItem {
  value: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}

/** A titled group of {@link SidebarItem}s. */
export interface SidebarSection {
  heading?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  /** The grouped navigation entries. */
  sections: SidebarSection[];
  /** The currently-active item value (rendered with `aria-current`). */
  activeValue?: string;
  /** Called with the value of the activated item. */
  onSelect?: (value: string) => void;
  /** Controlled collapsed state (icons only). */
  collapsed?: boolean;
  /** Initial collapsed state when uncontrolled. Defaults to `false`. */
  defaultCollapsed?: boolean;
  /** Called with the next collapsed state when the toggle is used. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Accessible label for the `<nav>`. Defaults to `'Sidebar'`. */
  'aria-label'?: string;
}

const sidebar = tokens.comp.sidebar;
const c = cssVars.comp.sidebar;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);

/**
 * A hand-drawn collapsible app sidebar. Renders a `<nav>` of sections and items
 * with an active state (`aria-current`) and a collapse toggle that hides the
 * labels/headings (icons only). Controlled or uncontrolled via `collapsed`.
 * Colours, spacing and typography come from `@ghds/tokens` (`comp.sidebar.*`).
 */
export function Sidebar({
  sections,
  activeValue,
  onSelect,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  'aria-label': ariaLabel = 'Sidebar',
}: SidebarProps) {
  const isControlled = controlledCollapsed !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const toggleCollapsed = () => {
    const next = !collapsed;
    if (!isControlled) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  const navStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.sys.spacing.md,
    boxSizing: 'border-box',
    width: collapsed ? '3.5rem' : '15rem',
    height: '100%',
    padding: sidebar.padding,
    background: c.bg,
    borderRight: `${STROKE_WIDTH}px solid ${c.stroke}`,
    color: c.text,
    fontFamily: tokens.sys.typography.body.fontFamily,
    transition: `width ${tokens.sys.animation.duration.normal} ${tokens.sys.animation.easing.standard}`,
    overflow: 'hidden',
  };

  const toggleStyle: CSSProperties = {
    display: 'inline-flex',
    alignSelf: collapsed ? 'center' : 'flex-end',
    padding: tokens.sys.spacing.xs,
    border: 'none',
    borderRadius: tokens.sys.radius.sm,
    background: 'transparent',
    color: c.text,
    cursor: 'pointer',
  };

  return (
    <nav aria-label={ariaLabel} data-collapsed={collapsed} style={navStyle}>
      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        style={toggleStyle}
        onClick={toggleCollapsed}
      >
        <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size="sm" />
      </button>
      {sections.map((section, sectionIndex) => (
        <ul
          // biome-ignore lint/suspicious/noArrayIndexKey: sections are a stable, ordered prop list without ids
          key={sectionIndex}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.sys.spacing.xs,
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {section.heading !== undefined && !collapsed && (
            <li
              style={{
                padding: `${tokens.sys.spacing.xs} ${tokens.sys.spacing.sm}`,
                color: tokens.sys.color.text.secondary,
                fontSize: tokens.sys.typography.caption.fontSize,
                fontWeight: tokens.sys.typography.label.fontWeight,
                textTransform: 'uppercase',
                letterSpacing: tokens.sys.typography.tracking.wide,
              }}
            >
              {section.heading}
            </li>
          )}
          {section.items.map((item) => {
            const isActive = item.value === activeValue;
            const itemStyle: CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              gap: tokens.sys.spacing.sm,
              width: '100%',
              padding: `${tokens.sys.spacing.sm} ${tokens.sys.spacing.sm}`,
              border: 'none',
              borderRadius: tokens.sys.radius.sm,
              background: isActive ? c.item.active : 'transparent',
              color: isActive ? c.item.activeText : c.text,
              opacity: item.disabled ? 0.5 : 1,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontFamily: tokens.sys.typography.label.fontFamily,
              fontSize: tokens.sys.typography.label.fontSize,
              fontWeight: tokens.sys.typography.label.fontWeight,
              whiteSpace: 'nowrap',
            };
            return (
              <li key={item.value}>
                <button
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  disabled={item.disabled}
                  title={collapsed ? item.label : undefined}
                  style={itemStyle}
                  onClick={() => !item.disabled && onSelect?.(item.value)}
                >
                  {item.icon !== undefined && <Icon name={item.icon} size="sm" />}
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      ))}
    </nav>
  );
}
