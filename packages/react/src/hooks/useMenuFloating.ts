import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { tokens } from '@ghds/tokens';
import { toPx } from '../lib/units.js';

/**
 * Anchor a `position: fixed` dropdown panel below its trigger (`bottom-start`,
 * flipping above and shifting inside the viewport when it would overflow),
 * tracking scroll / resize only while `open`.
 *
 * Shared by the dropdown components whose panel hangs off a trigger button
 * (`Menu`, `NavMenu`) so the floating-ui setup lives in one place. The gap
 * between trigger and panel and the viewport padding come from
 * `comp.menu.panel.offset` and `sys.spacing.sm`.
 */
export function useMenuFloating(open: boolean): ReturnType<typeof useFloating> {
  return useFloating({
    open,
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: open ? autoUpdate : undefined,
    middleware: [
      offset(toPx(tokens.comp.menu.panel.offset)),
      flip(),
      shift({ padding: toPx(tokens.sys.spacing.sm) }),
    ],
  });
}
