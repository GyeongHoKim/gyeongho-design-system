import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** One menu entry. */
export interface GhMenuItem {
  value: string;
  label: string;
  disabled?: boolean;
}

let menuUid = 0;

/**
 * `<gh-menu>` — a hand-drawn menu (dropdown).
 *
 * A `<button>` trigger (`aria-haspopup="menu"`) opens a floating `role="menu"`
 * of `role="menuitem"`s. Enter/Space/ArrowDown open; Arrow/Home/End move focus;
 * Enter/Space activate; Escape closes and restores trigger focus. Dispatches a
 * `select` `CustomEvent<string>`. Colours and sketch parameters are token-driven
 * (`comp.menu.*`).
 */
@customElement('gh-menu')
export class GhMenu extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: inline-block;
        color: var(--comp-menu-trigger-stroke-default);
      }

      .trigger {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--sys-spacing-xs);
        box-sizing: border-box;
        margin: 0;
        padding: var(--comp-menu-trigger-padding-vertical) var(--comp-menu-trigger-padding-horizontal);
        border: none;
        background: transparent;
        color: var(--comp-menu-trigger-text-default);
        font-family: var(--sys-typography-label-fontFamily);
        font-size: var(--sys-typography-label-fontSize);
        font-weight: var(--sys-typography-label-fontWeight);
        line-height: var(--sys-typography-label-lineHeight);
        cursor: pointer;
      }

      .trigger:disabled {
        cursor: not-allowed;
      }

      .trigger:focus-visible {
        outline: var(--sys-border-width-thick) solid var(--comp-menu-trigger-stroke-focus);
        outline-offset: var(--sys-spacing-xs);
      }

      .label {
        position: relative;
      }

      .panel {
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--comp-menu-panel-zIndex);
        display: none;
        flex-direction: column;
        gap: var(--comp-menu-panel-gap);
        min-width: 10rem;
        box-sizing: border-box;
        padding: var(--comp-menu-panel-padding);
        background: var(--comp-menu-panel-bg);
        border: var(--sys-border-width-default) solid var(--comp-menu-panel-stroke);
        border-radius: var(--comp-menu-panel-radius);
        box-shadow: var(--comp-menu-panel-shadow);
      }

      .panel.open {
        display: flex;
      }

      .item {
        display: flex;
        align-items: center;
        padding: var(--comp-menu-item-padding-vertical) var(--comp-menu-item-padding-horizontal);
        border-radius: var(--comp-menu-item-radius);
        color: var(--comp-menu-item-text-default);
        background: var(--comp-menu-item-bg-default);
        font-family: var(--sys-typography-body-fontFamily);
        font-size: var(--sys-typography-body-fontSize);
        cursor: pointer;
        outline: none;
      }

      .item[aria-disabled='true'] {
        color: var(--comp-menu-item-text-disabled);
        cursor: not-allowed;
      }

      .item.highlighted:not([aria-disabled='true']) {
        background: var(--comp-menu-item-bg-highlighted);
      }
    `,
  ];

  @property({ attribute: false }) items: GhMenuItem[] = [];
  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private open = false;
  @state() private activeIndex = 0;

  @query('.trigger') private triggerEl?: HTMLButtonElement;
  @query('.panel') private panelEl?: HTMLElement;

  private readonly uid = `gh-menu-${menuUid++}`;
  private cleanupAutoUpdate?: () => void;

  protected override get frame(): HTMLElement {
    return this.triggerEl ?? this;
  }

  private get enabledIndexes(): number[] {
    return this.items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
  }

  override disconnectedCallback(): void {
    this.cleanupAutoUpdate?.();
    document.removeEventListener('pointerdown', this.onPointerDown);
    super.disconnectedCallback();
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    const target = event.target as Node;
    if (!this.contains(target)) {
      this.close(false);
    }
  };

  private async openMenu(index: number): Promise<void> {
    this.open = true;
    this.activeIndex = index;
    document.addEventListener('pointerdown', this.onPointerDown);
    await this.updateComplete;
    const trigger = this.triggerEl;
    const panel = this.panelEl;
    if (trigger && panel) {
      this.cleanupAutoUpdate = autoUpdate(trigger, panel, () => {
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
    this.focusActive();
  }

  private close(restoreFocus = true): void {
    this.open = false;
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
    document.removeEventListener('pointerdown', this.onPointerDown);
    if (restoreFocus) {
      this.triggerEl?.focus();
    }
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

  private readonly onTriggerKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }
    const first = this.enabledIndexes[0] ?? 0;
    const last = this.enabledIndexes[this.enabledIndexes.length - 1] ?? 0;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void this.openMenu(first);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      void this.openMenu(last);
    }
  };

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
      case 'Tab':
        this.close(false);
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
      roughness: tokens.comp.menu.sketch.roughness,
      bowing: tokens.comp.menu.sketch.bowing,
      fillStyle: 'solid',
    };
  }

  protected override render(): unknown {
    return html`<button
        class="trigger"
        id=${this.uid}
        type="button"
        aria-haspopup="menu"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls=${`${this.uid}-menu`}
        ?disabled=${this.disabled}
        @click=${() => (this.open ? this.close(false) : this.openMenu(this.enabledIndexes[0] ?? 0))}
        @keydown=${this.onTriggerKeydown}
      >
        ${this.renderSketch()}
        <span class="label"><slot>${this.label}</slot></span>
      </button>
      <div
        class=${this.open ? 'panel open' : 'panel'}
        id=${`${this.uid}-menu`}
        role="menu"
        aria-label=${this.label}
        @keydown=${this.onPanelKeydown}
      >
        ${this.items.map(
          (item, index) => html`<div
            class=${index === this.activeIndex ? 'item highlighted' : 'item'}
            role="menuitem"
            tabindex="-1"
            aria-disabled=${item.disabled ? 'true' : 'false'}
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
    'gh-menu': GhMenu;
  }
}
