import { tokens } from '@ghds/tokens';
import { Slot, Slottable } from '@radix-ui/react-slot';
import {
  type CSSProperties,
  type FocusEvent,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  useState,
} from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { CardFastenerMark } from './CardFastener.js';
import {
  type CardFastener,
  type CardTilt,
  type CardTone,
  type CardVariant,
  cardBodyStyle,
  linedMarginStyle,
  paperStyle,
  tiltAngle,
} from './cardPaper.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export type { CardFastener, CardTilt, CardTone, CardVariant };

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Fill style of the card body. `'solid'` (default) paints a hand-cut paper
   * surface; `'hachure'` gives a sketched, translucent fill. Applies to the
   * `plain` variant only.
   */
  fill?: 'solid' | 'hachure';
  /**
   * Surface treatment. `'plain'` (default) is the sketch-outlined card;
   * `'sticky'` is a coloured note with a folded corner; `'lined'` is ruled
   * notebook paper. Paper variants render a plain `div` with no sketch outline.
   */
  variant?: CardVariant;
  /**
   * Colour tone. Sets the paper colour of a `sticky` card and the pin head
   * colour on every variant. Default `'neutral'`.
   */
  tone?: CardTone;
  /** Tape or pin mark at the top edge; renders on every variant. Default `'none'`. */
  fastener?: CardFastener;
  /** Leans a paper card by a token angle; no effect on `plain`. Default `'none'`. */
  tilt?: CardTilt;
  /**
   * Lifts the card on mouse hover and while focus is inside. Paper variants
   * also gain a raised shadow; a `plain` card only moves (no shadow change).
   * Default `false`. (Independently of this prop, a card made focusable with
   * `tabIndex` shows the `comp.card.focus.ring` outline on keyboard focus
   * instead of the browser default.)
   */
  interactive?: boolean;
  /**
   * Render as the single child element (Radix `Slot`) instead of a `<div>`,
   * e.g. `<Card asChild><a href="/docs">…</a></Card>` to make the whole card a
   * link. The child keeps its own semantics and receives the card's styles and
   * decorations. An `asChild` card is treated as interactive: it lifts on hover
   * and focus, a `plain` card's stroke darkens on hover, and keyboard focus
   * shows a focus ring. Default `false`.
   */
  asChild?: boolean;
  /**
   * Inline style. Merged last on every variant, so it overrides the card's own
   * styles (for example `margin` or `transform`).
   */
  style?: CSSProperties;
}

const card = tokens.comp.card;
const c = cssVars.comp.card;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const FOCUS_RING_WIDTH = toPx(tokens.sys.border.width.thick);

/** Whether `element` shows keyboard focus; true where `:focus-visible` is unsupported. */
function isFocusVisible(element: Element): boolean {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}

/**
 * A hand-drawn surface container. The sketchy border + paper fill are generated
 * by `@ghds/sketch-core` (via {@link useSketch}); every color, padding, radius,
 * typography and sketch parameter comes from `@ghds/tokens` (`comp.card.*`).
 * Renders a plain `<div>`, so any ARIA role/landmark is the caller's to set;
 * with `asChild` it renders as its single child element instead (e.g. a link).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    fill = 'solid',
    variant = 'plain',
    tone = 'neutral',
    fastener = 'none',
    tilt = 'none',
    interactive: interactiveProp = false,
    asChild = false,
    children,
    style,
    ...rest
  },
  forwardedRef,
) {
  const { onPointerEnter, onPointerLeave, onFocus, onBlur, onKeyDown, onKeyUp } = rest;
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: fill,
    roughness: card.sketch.roughness,
    bowing: card.sketch.bowing,
    hachureGap: tokens.sys.sketch.hachureGap,
    hachureAngle: tokens.sys.sketch.hachureAngle,
    inset: INSET,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // A slotted child (typically a link) is interactive by nature.
  const interactive = interactiveProp || asChild;
  // The card itself takes focus: an `asChild` link or a `tabIndex` card. Like
  // gh-card's `:host(:focus-visible)`, its ring replaces the browser default
  // whether or not it is interactive.
  const focusable = asChild || rest.tabIndex != null;

  // Leave handlers are only attached while interactive (focus handlers while
  // focusable), so drop any stale state when that turns off; otherwise turning
  // it back on would lift a card that isn't hovered.
  if (!interactive && (hovered || focused)) {
    setHovered(false);
    setFocused(false);
  }
  if (!interactive && !focusable && focusVisible) setFocusVisible(false);

  // Anything other than a known paper variant renders as plain.
  const paper = variant === 'sticky' || variant === 'lined' ? variant : null;
  const cardAngle = paper ? tiltAngle(paper, tilt) : '0deg';
  const mark =
    fastener === 'none' ? null : (
      <CardFastenerMark kind={fastener} tone={tone} cardAngle={cardAngle} />
    );

  // An `asChild` link lifts only on keyboard focus, like the web component's
  // `a.content:focus-visible`; a mouse-focused link stays flat. A plain
  // interactive card keeps lifting on any focus within (`:focus-within`).
  const lifted = interactive && (hovered || (asChild ? focusVisible : focused));
  const interactiveStyle: CSSProperties = interactive
    ? {
        transition: reducedMotion
          ? 'none'
          : `transform ${c.hover.duration} ${c.hover.easing}, box-shadow ${c.hover.duration} ${c.hover.easing}`,
        ...(lifted
          ? {
              transform: `translateY(calc(${c.hover.lift} * -1)) rotate(calc(${cardAngle} - ${c.hover.rotate} * 1deg))`,
              // A plain card's surface is the sketch SVG; a box shadow would be rectangular.
              ...(paper ? { boxShadow: c.hover.shadow } : {}),
            }
          : {}),
      }
    : {};
  const focusHandlers =
    interactive || focusable
      ? {
          onFocus: (event: FocusEvent<HTMLDivElement>) => {
            if (interactive) setFocused(true);
            // The ring marks the card itself (an `asChild` link or a `tabIndex` card),
            // not a focused descendant.
            setFocusVisible(
              event.target === event.currentTarget && isFocusVisible(event.currentTarget),
            );
            onFocus?.(event);
          },
          onBlur: (event: FocusEvent<HTMLDivElement>) => {
            const next = event.relatedTarget;
            if (!(next instanceof Node && event.currentTarget.contains(next))) setFocused(false);
            setFocusVisible(false);
            onBlur?.(event);
          },
          // A mouse-focused card starts matching `:focus-visible` once a key is
          // pressed (as gh-card's live `:host(:focus-visible)` does), but no new
          // focus event fires, so re-check on key events while the card itself
          // has focus.
          onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
            if (!focusVisible && event.target === event.currentTarget) {
              setFocusVisible(isFocusVisible(event.currentTarget));
            }
            onKeyDown?.(event);
          },
          onKeyUp: (event: KeyboardEvent<HTMLDivElement>) => {
            if (!focusVisible && event.target === event.currentTarget) {
              setFocusVisible(isFocusVisible(event.currentTarget));
            }
            onKeyUp?.(event);
          },
        }
      : {};
  // Consumer handlers stay in `rest`; when interactive or focusable they are wrapped here.
  const handlers = interactive
    ? {
        ...focusHandlers,
        onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
          if (event.pointerType === 'mouse') setHovered(true);
          onPointerEnter?.(event);
        },
        onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
          setHovered(false);
          onPointerLeave?.(event);
        },
      }
    : focusHandlers;

  // A focusable card (an `asChild` link or a `tabIndex` card) draws the token
  // focus ring instead of the browser default; on the card itself it follows
  // the folded corner and the tilt. The outline is only set while
  // keyboard-focused; otherwise it is left to the UA (and the consumer's own
  // styles), so a card that becomes `:focus-visible` later (mouse focus, then a
  // key press) still shows the browser's ring instead of none.
  const focusStyle: CSSProperties =
    (interactive || focusable) && focusVisible
      ? {
          outline: `${FOCUS_RING_WIDTH}px solid ${c.focus.ring}`,
          outlineOffset: tokens.sys.spacing.xs,
        }
      : {};
  // A slotted link must not look like inline text.
  const linkStyle: CSSProperties = asChild
    ? { textDecoration: 'none', cursor: 'pointer', ...focusStyle }
    : focusStyle;

  const rootStyle: CSSProperties = paper
    ? {
        ...paperStyle({ variant: paper, tone, tilt, fastener }),
        ...linkStyle,
        ...interactiveStyle,
        ...style,
      }
    : {
        // Scopes the `SketchSurface` (`z-index: -1`) to this card so an opaque
        // ancestor can't paint over it (see `sketchHostStyle`).
        ...sketchHostStyle,
        ...cardBodyStyle,
        padding: card.padding,
        // Pivot from the top edge like paper cards, so a lift swings from the fastener.
        ...(fastener !== 'none' ? { transformOrigin: '50% 0' } : {}),
        ...linkStyle,
        ...interactiveStyle,
        ...style,
      };

  const surface = paper ? null : (
    <SketchSurface
      drawable={drawable}
      width={size.width}
      height={size.height}
      strokeColor={asChild && hovered ? c.stroke.hover : c.stroke.default}
      strokeWidth={STROKE_WIDTH}
      fillColor={fill === 'solid' ? c.bg.default : c.bg.muted}
      fillRendering={fill === 'solid' ? 'fill' : 'stroke'}
      fillStrokeWidth={toPx(tokens.sys.border.width.thin)}
    />
  );
  const marginLine =
    paper === 'lined' ? (
      <span aria-hidden="true" data-card-margin-line="" style={linedMarginStyle} />
    ) : null;

  if (asChild) {
    return (
      <Slot ref={paper ? forwardedRef : ref} style={rootStyle} {...rest} {...handlers}>
        {mark}
        {surface}
        <Slottable>{children}</Slottable>
        {marginLine}
      </Slot>
    );
  }

  // One element tree for every variant: decorative layers sit in fixed slots, so
  // switching `variant` never remounts the children (their state and focus survive).
  return (
    <div ref={paper ? forwardedRef : ref} style={rootStyle} {...rest} {...handlers}>
      {mark}
      {surface}
      {children}
      {marginLine}
    </div>
  );
});
