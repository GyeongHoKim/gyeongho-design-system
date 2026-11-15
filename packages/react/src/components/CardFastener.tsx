import type { CSSProperties } from 'react';
import { cssVars } from '../lib/cssVars.js';
import type { CardTone } from './cardPaper.js';

const f = cssVars.comp.card.fastener;

// Pin drawing geometry (viewBox units). The head circle centre sits at
// (HEAD_X, HEAD_Y) and is what lands on the card's top edge.
const VIEW_WIDTH = 28;
const VIEW_HEIGHT = 30;
const HEAD_X = 14;
const HEAD_Y = 11;

export interface CardFastenerMarkProps {
  kind: 'tape' | 'pin';
  tone: CardTone;
  /** CSS angle expression of the card's lean; the tape counter-rotates it. */
  cardAngle: string;
}

/** Decorative tape or pin mark overhanging a card's top edge. */
export function CardFastenerMark({ kind, tone, cardAngle }: CardFastenerMarkProps) {
  if (kind === 'tape') {
    const tapeStyle: CSSProperties = {
      position: 'absolute',
      top: `calc(${f.tape.height} / -2)`,
      left: '50%',
      width: f.tape.width,
      height: f.tape.height,
      boxSizing: 'border-box',
      background: f.tape.bg,
      borderLeft: `${f.tape.border.width} dashed ${f.tape.border.color}`,
      borderRight: `${f.tape.border.width} dashed ${f.tape.border.color}`,
      opacity: f.tape.opacity,
      pointerEvents: 'none',
      transform: `translateX(-50%) rotate(calc(-1 * ${cardAngle} - ${f.tape.tilt} * 1deg))`,
    };
    return <span aria-hidden="true" style={tapeStyle} />;
  }

  const pinStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: f.pin.size,
    height: 'auto',
    overflow: 'visible',
    pointerEvents: 'none',
    transform: `translate(${(-HEAD_X / VIEW_WIDTH) * 100}%, ${(-HEAD_Y / VIEW_HEIGHT) * 100}%)`,
  };
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      style={pinStyle}
    >
      <ellipse
        cx="17"
        cy="24"
        rx="7"
        ry="3"
        style={{ fill: f.pin.shadow, fillOpacity: f.pin.shadowOpacity }}
      />
      <line
        x1="14"
        y1="14"
        x2="16"
        y2="24"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ stroke: f.pin.needle }}
      />
      <circle cx="14" cy="11" r="10" style={{ fill: f.pin.color[tone] }} />
      <circle
        cx="10.5"
        cy="7.5"
        r="3.5"
        style={{ fill: f.pin.highlight, fillOpacity: f.pin.highlightOpacity }}
      />
    </svg>
  );
}
