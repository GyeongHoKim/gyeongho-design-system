import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type { GhResizableDirection } from './resizable-handle.js';
import { GhResizableHandle } from './resizable-handle.js';
import { GhResizablePanel } from './resizable-panel.js';
import './resizable-handle.js';
import './resizable-panel.js';

interface PointerDownDetail {
  clientX: number;
  clientY: number;
  pointerId: number;
}

interface ResizeKeyDetail {
  delta: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * `<gh-resizable-group>` — a hand-drawn resizable split view built on pointer
 * events, with no third-party engine.
 *
 * Lay out `<gh-resizable-panel>`s separated by `<gh-resizable-handle>`s in the
 * default slot; dragging a handle (or focusing it and pressing the arrow keys)
 * redistributes space between its two neighbours while keeping their combined
 * size constant, clamped to each panel's `minSize`/`maxSize`. Sizes are
 * percentages of the group and panels are laid out with `flex-basis`.
 */
@customElement('gh-resizable-group')
export class GhResizableGroup extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .group {
      display: flex;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    :host([direction='vertical']) .group {
      flex-direction: column;
    }

    :host(:not([direction='vertical'])) .group {
      flex-direction: row;
    }
  `;

  /** Axis the panels are laid out and resized along. Defaults to `'horizontal'`. */
  @property({ type: String, reflect: true }) direction: GhResizableDirection = 'horizontal';

  @query('.group') private groupEl!: HTMLDivElement;

  private sizes: number[] = [];
  private readonly handleBefore = new Map<GhResizableHandle, number>();

  private get horizontal(): boolean {
    return this.direction !== 'vertical';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(
      'gh-resizable-handle-pointerdown',
      this.handlePointerDown as EventListener,
    );
    this.addEventListener('gh-resizable-handle-key', this.handleResizeKey as EventListener);
  }

  override disconnectedCallback(): void {
    this.removeEventListener(
      'gh-resizable-handle-pointerdown',
      this.handlePointerDown as EventListener,
    );
    this.removeEventListener('gh-resizable-handle-key', this.handleResizeKey as EventListener);
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.layout();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('direction')) {
      this.layout();
    }
  }

  /** The slotted panels and handles in DOM order. */
  private get items(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector('slot');
    return (slot?.assignedElements({ flatten: true }) ?? []).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
  }

  private get panels(): GhResizablePanel[] {
    return this.items.filter((item): item is GhResizablePanel => item instanceof GhResizablePanel);
  }

  private readonly layout = (): void => {
    const items = this.items;
    const panels = this.panels;
    if (panels.length === 0) {
      return;
    }
    if (this.sizes.length !== panels.length) {
      const even = 100 / panels.length;
      const raw = panels.map((panel) => panel.defaultSize ?? even);
      const total = raw.reduce((sum, value) => sum + value, 0);
      this.sizes = total > 0 ? raw.map((value) => (value / total) * 100) : raw;
    }
    this.apply(items);
  };

  private apply(items: HTMLElement[]): void {
    this.handleBefore.clear();
    let cursor = 0;
    for (const item of items) {
      if (item instanceof GhResizablePanel) {
        item.style.flexGrow = '0';
        item.style.flexShrink = '0';
        item.style.flexBasis = `${this.sizes[cursor]}%`;
        cursor += 1;
      } else if (item instanceof GhResizableHandle) {
        const before = cursor - 1;
        item.direction = this.direction;
        if (before >= 0) {
          item.valueNow = this.sizes[before];
          this.handleBefore.set(item, before);
        }
      }
    }
  }

  private resizePair(before: number, startSizes: number[], deltaPct: number): void {
    const panels = this.panels;
    const a = before;
    const b = before + 1;
    const sizeA = startSizes[a];
    const sizeB = startSizes[b];
    const panelA = panels[a];
    const panelB = panels[b];
    if (a < 0 || b >= startSizes.length || sizeA === undefined || sizeB === undefined) {
      return;
    }
    if (!panelA || !panelB) {
      return;
    }
    const pairTotal = sizeA + sizeB;
    let nextA = clamp(sizeA + deltaPct, panelA.minSize, panelA.maxSize);
    // Keep the pair's combined size constant, then re-clamp against B.
    const nextB = clamp(pairTotal - nextA, panelB.minSize, panelB.maxSize);
    nextA = pairTotal - nextB;
    const next = [...startSizes];
    next[a] = nextA;
    next[b] = nextB;
    this.sizes = next;
    this.apply(this.items);
  }

  private readonly handlePointerDown = (event: CustomEvent<PointerDownDetail>): void => {
    const handle = event.target as GhResizableHandle;
    const before = this.handleBefore.get(handle);
    if (before === undefined) {
      return;
    }
    const group = this.groupEl;
    if (!group) {
      return;
    }
    const extent = this.horizontal ? group.clientWidth : group.clientHeight;
    const startPos = this.horizontal ? event.detail.clientX : event.detail.clientY;
    const startSizes = [...this.sizes];
    const onMove = (moveEvent: PointerEvent): void => {
      const pos = this.horizontal ? moveEvent.clientX : moveEvent.clientY;
      const deltaPct = extent > 0 ? ((pos - startPos) / extent) * 100 : 0;
      this.resizePair(before, startSizes, deltaPct);
    };
    const onUp = (): void => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.userSelect = '';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    document.body.style.userSelect = 'none';
  };

  private readonly handleResizeKey = (event: CustomEvent<ResizeKeyDetail>): void => {
    const handle = event.target as GhResizableHandle;
    const before = this.handleBefore.get(handle);
    if (before === undefined) {
      return;
    }
    this.resizePair(before, this.sizes, event.detail.delta);
  };

  protected override render(): unknown {
    return html`<div class="group" part="group">
      <slot @slotchange=${this.layout}></slot>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-resizable-group': GhResizableGroup;
  }
}
