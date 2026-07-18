import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Desired width-to-height ratio, e.g. `16 / 9` for widescreen media or `1`
   * for a square. Defaults to `1`.
   */
  ratio?: number;
}

/**
 * A layout primitive that constrains its content to a fixed width-to-height
 * ratio using the native CSS `aspect-ratio` property. Purely structural — it
 * owns no design values and paints nothing, so there is no sketch layer.
 *
 * Size a single child to `width: 100%; height: 100%` (e.g. an `<img>` with
 * `object-fit: cover`) to fill the ratio box.
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 1, children, style, ...rest },
  forwardedRef,
) {
  const rootStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: String(ratio),
    overflow: 'hidden',
    ...style,
  };

  return (
    <div ref={forwardedRef} style={rootStyle} {...rest}>
      {children}
    </div>
  );
});
