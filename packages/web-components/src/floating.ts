import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { tokens } from '@ghds/tokens';

/**
 * Anchor a `position: fixed` dropdown panel below its trigger (`bottom-start`,
 * flipping above and shifting inside the viewport when it would overflow) and
 * keep it there while the page scrolls or resizes.
 *
 * Shared by the dropdown components whose panel hangs off a trigger button
 * (`gh-menu`, `gh-nav-menu`) so the floating-ui setup lives in one place. The
 * gap between trigger and panel and the viewport padding come from
 * `comp.menu.panel.offset` and `sys.spacing.sm`.
 *
 * Returns the cleanup function that stops tracking.
 */
export function anchorMenuPanel(trigger: HTMLElement, panel: HTMLElement): () => void {
  return autoUpdate(trigger, panel, () => {
    computePosition(trigger, panel, {
      strategy: 'fixed',
      placement: 'bottom-start',
      middleware: [
        offset(Number.parseFloat(tokens.comp.menu.panel.offset)),
        flip(),
        shift({ padding: Number.parseFloat(tokens.sys.spacing.sm) }),
      ],
    }).then(({ x, y }) => {
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
    });
  });
}
