import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';

/** Layout axis of a {@link ButtonGroup}. */
export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout axis. Defaults to `'horizontal'`. */
  orientation?: ButtonGroupOrientation;
  /** Accessible label for the group. */
  'aria-label'?: string;
}

const group = tokens.comp.buttonGroup;

/**
 * A segmented group of related buttons. Renders `role="group"` and lays its
 * `Button`/`Toggle` children out along one axis with the spacing from
 * `@ghds/tokens` (`comp.buttonGroup.*`). Purely a layout/semantics wrapper — the
 * hand-drawn look comes from the buttons it contains.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation = 'horizontal', children, style, ...rest },
  forwardedRef,
) {
  const rootStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    alignItems: orientation === 'vertical' ? 'stretch' : 'center',
    gap: group.gap,
    ...style,
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a `<fieldset>` would impose form-group semantics/styling; `role="group"` is the correct generic grouping for a set of related buttons
    <div ref={forwardedRef} role="group" data-orientation={orientation} style={rootStyle} {...rest}>
      {children}
    </div>
  );
});
