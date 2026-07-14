import { computePosition, flip, shift } from '@floating-ui/dom';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';
import type { GhMenuItem } from './menu.js';

export type { GhMenuItem };

let contextMenuUid = 0;

/**
 * `<gh-context-menu>` — a hand-drawn right-click menu.
 *
 * Wraps a slotted target; a `contextmenu` (right-click) over it opens a floating
 * `role="menu"` of `role="menuitem"`s at the pointer, positioned with
 * `@floating-ui/dom`. Arrow / Home / End move the highlight, Enter/Space
 * activate, Escape closes. Dispatches a `select` `CustomEvent<string>`. Colours
 * and sketch parameters come from `@ghds/tokens` (`comp.contextMenu.*`).
 */
@customElement('gh-context-menu')
export class GhContextMenu extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--comp-contextMenu-stroke);
      }

      .panel {
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--comp-contextMenu-zIndex);
        display: none;
        flex-direction: column;
        gap: var(--sys-spacing-xs);
        min-width: 10rem;
        box-sizing: border-box;
        padding: var(--comp-contextMenu-padding);
      }

      .panel.open {
        display: flex;
      }

      .surface {
        position: absolute;
        inset: 0;
      }

      .item {
        position: relative;
        display: flex;
        align-items: center;
        padding: var(--sys-spacing-xs) var(--sys-spacing-sm);
        border-radius: var(--sys-radius-sm);
        color: var(--comp-contextMenu-text);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        cursor: pointer;
        outline: none;
      }

      .item[data-danger] {
        color: var(--comp-contextMenu-item-danger);
      }

      .item[aria-disabled='true'] {
        color: var(--sys-color-text-disabled);
        cursor: not-allowed;
      }

      .item.highlighted:not([aria-disabled='true']) {
        background: var(--comp-contextMenu-item-hover);
      }

      .sketch-fill {
        fill: var(--comp-contextMenu-bg);
        stroke: none;
      }
    `,
  ];

  /** The menu entries. Set `danger` on an item id via `dangerValues`. */
  @property({ attribute: false }) items: GhMenuItem[] = [];
  /** Item values rendered with the destructive colour. */
  @property({ attribute: false }) dangerValues: string[] = [];

  @state() private open = false;
  @state() private activeIndex = 0;

  @query('.panel') private panelEl?: HTMLElement;

  private readonly uid = `gh-context-menu-${contextMenuUid++}`;
  private x = 0;
  private y = 0;

  protected override get frame(): HTMLElement {
    return this.panelEl ?? this;
  }

  private get enabledIndexes(): number[] {
    return this.items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('contextmenu', this.onContextMenu);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('contextmenu', this.onContextMenu);
    document.removeEventListener('pointerdown', this.onPointerDown);
    super.disconnectedCallback();
  }

  private readonly onContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    this.x = event.clientX;
    this.y = event.clientY;
    void this.show(this.enabledIndexes[0] ?? 0);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.close();
    }
  };

  private async show(index: number): Promise<void> {
    this.open = true;
    this.activeIndex = index;
    document.addEventListener('pointerdown', this.onPointerDown);
    await this.updateComplete;
    const panel = this.panelEl;
    if (panel) {
      const reference = {
        getBoundingClientRect: () => ({
          x: this.x,
          y: this.y,
          top: this.y,
          left: this.x,
          right: this.x,
          bottom: this.y,
          width: 0,
          height: 0,
          toJSON: () => ({}),
        }),
      };
      const { x, y } = await computePosition(reference, panel, {
        strategy: 'fixed',
        placement: 'right-start',
        middleware: [flip(), shift({ padding: Number.parseFloat(tokens.sys.spacing.sm) })],
      });
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      this.measure();
    }
    this.focusActive();
  }

  private close(): void {
    this.open = false;
    document.removeEventListener('pointerdown', this.onPointerDown);
  }

  private focusActive(): void {
    this.updateComplete.then(() => {
      const items = this.panelEl?.querySelectorAll<HTMLElement>('.item');
      items?.[this.activeIndex]?.focus();
    });
  }

  private moveActive(direction: 1 | -1): void {
    const positions = this.enabledIndexes;
    const currentPos = positions.indexOf(this.activeIndex);
    const nextPos = (currentPos + direction + positions.length) % positions.length;
    const next = positions[nextPos];
    if (next !== undefined) {
      this.activeIndex = next;
      this.focusActive();
    }
  }

  private selectItem(item: GhMenuItem): void {
    if (item.disabled) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('select', { detail: item.value, bubbles: true, composed: true }),
    );
    this.close();
  }

  private readonly onPanelKeydown = (event: KeyboardEvent): void => {
    const first = this.enabledIndexes[0] ?? 0;
    const last = this.enabledIndexes[this.enabledIndexes.length - 1] ?? 0;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex = first;
        this.focusActive();
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex = last;
        this.focusActive();
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const item = this.items[this.activeIndex];
        if (item) {
          this.selectItem(item);
        }
        break;
      }
    }
  };

  protected override sketch(width: number, height: number, options: SketchOptions): SketchDrawable {
    return rectangle(0, 0, width, height, options);
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.contextMenu.sketch.roughness,
      bowing: tokens.comp.contextMenu.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<slot></slot>
      <div
        class=${this.open ? 'panel open' : 'panel'}
        id=${`${this.uid}-menu`}
        role="menu"
        @keydown=${this.onPanelKeydown}
      >
        <div class="surface">${this.renderSketch()}</div>
        ${this.items.map(
          (item, index) => html`<div
            class=${index === this.activeIndex ? 'item highlighted' : 'item'}
            role="menuitem"
            tabindex="-1"
            aria-disabled=${item.disabled ? 'true' : 'false'}
            data-danger=${this.dangerValues.includes(item.value) ? '' : nothing}
            @click=${() => this.selectItem(item)}
            @mouseenter=${() => {
              if (!item.disabled) {
                this.activeIndex = index;
              }
            }}
          >
            ${item.label}
          </div>`,
        )}
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-context-menu': GhContextMenu;
  }
}
