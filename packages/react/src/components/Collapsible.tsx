import { tokens } from '@ghds/tokens';
import { type CSSProperties, type ReactNode, useCallback, useId, useState } from 'react';
import { cssVars } from '../lib/cssVars.js';
import { Icon } from './Icon.js';

export interface CollapsibleProps {
  /** Trigger label (rendered inside the disclosure button). */
  label: ReactNode;
  /** Collapsible content. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the next open state when it changes. */
  onOpenChange?: (open: boolean) => void;
  /** Disables the trigger. */
  disabled?: boolean;
}

const c = cssVars.comp.collapsible;

/**
 * A single hand-drawn disclosure. A `<button>` (`aria-expanded` +
 * `aria-controls`) toggles a content region; the region is unmounted from the
 * a11y tree (`hidden`) while collapsed. Colours, spacing and typography come
 * from `@ghds/tokens` (`comp.collapsible.*`). Non-sketchy chrome — pair it with
 * hand-drawn content.
 */
export function Collapsible({
  label,
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
}: CollapsibleProps) {
  const contentId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const toggle = useCallback(() => {
    const next = !open;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }, [open, isControlled, onOpenChange]);

  const triggerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.sys.spacing.xs,
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: c.text,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
  };

  const contentStyle: CSSProperties = {
    marginTop: tokens.sys.spacing.sm,
    color: c.text,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        disabled={disabled}
        data-state={open ? 'open' : 'closed'}
        style={triggerStyle}
        onClick={toggle}
      >
        <Icon
          name="chevron-down"
          size="sm"
          style={{
            transform: open ? 'rotate(180deg)' : undefined,
            transition: `transform ${tokens.sys.animation.duration.fast} ${tokens.sys.animation.easing.standard}`,
          }}
        />
        <span>{label}</span>
      </button>
      <div id={contentId} hidden={!open} style={contentStyle}>
        {children}
      </div>
    </div>
  );
}
