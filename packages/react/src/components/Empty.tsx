import type { IconName } from '@ghds/icons';
import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cssVars } from '../lib/cssVars.js';
import { Icon } from './Icon.js';

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional illustrative icon shown above the title. */
  icon?: IconName;
  /** Primary heading describing the empty state. */
  title: ReactNode;
  /** Supporting text explaining the state or next step. */
  description?: ReactNode;
  /** Optional call-to-action (e.g. a `Button`), rendered below the text. */
  action?: ReactNode;
}

const c = cssVars.comp.empty;
const empty = tokens.comp.empty;

/**
 * An empty-state placeholder: an optional icon, a title, an optional
 * description and an optional action, stacked and centred. Colours, spacing and
 * typography come from `@ghds/tokens` (`comp.empty.*`). Not sketchy itself — it
 * composes hand-drawn children (`Icon`, `Button`).
 */
export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { icon, title, description, action, style, ...rest },
  forwardedRef,
) {
  const rootStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: empty.gap,
    padding: empty.padding,
    fontFamily: tokens.sys.typography.body.fontFamily,
    ...style,
  };

  return (
    <div ref={forwardedRef} style={rootStyle} {...rest}>
      {icon !== undefined && (
        <span style={{ display: 'inline-flex', color: c.icon }}>
          <Icon name={icon} size="lg" />
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.sys.spacing.xs }}>
        <div
          style={{
            color: c.text.default,
            fontFamily: tokens.sys.typography.title.fontFamily,
            fontSize: tokens.sys.typography.title.fontSize,
            fontWeight: tokens.sys.typography.title.fontWeight,
            lineHeight: String(tokens.sys.typography.title.lineHeight),
          }}
        >
          {title}
        </div>
        {description !== undefined && (
          <div
            style={{
              color: c.text.muted,
              fontSize: tokens.sys.typography.body.fontSize,
              lineHeight: String(tokens.sys.typography.body.lineHeight),
            }}
          >
            {description}
          </div>
        )}
      </div>
      {action !== undefined && <div>{action}</div>}
    </div>
  );
});
