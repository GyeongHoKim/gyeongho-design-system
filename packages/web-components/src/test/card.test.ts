import { afterEach, describe, expect, it } from 'vitest';
import { GhCard } from '../components/card.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-card', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-card')).toBe(GhCard);
  });

  it('renders slotted content inside the surface', async () => {
    const el = await mount(new GhCard());
    el.innerHTML = '<p>Body</p>';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.content slot')).not.toBeNull();
    expect(el.textContent).toContain('Body');
  });

  it('renders a named title slot before the default slot', async () => {
    const el = await mount(new GhCard());
    el.innerHTML = '<h3 slot="title">Heading</h3><p>Body</p>';
    await el.updateComplete;
    const titleSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('.body slot[name="title"]');
    const defaultSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('.body slot:not([name])');
    expect(titleSlot).not.toBeNull();
    expect(defaultSlot).not.toBeNull();
    expect(titleSlot?.assignedElements().map((n) => n.textContent)).toEqual(['Heading']);
    expect(defaultSlot?.assignedElements().map((n) => n.textContent)).toEqual(['Body']);
    if (titleSlot && defaultSlot) {
      expect(
        titleSlot.compareDocumentPosition(defaultSlot) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it.each([
    'sticky',
    'lined',
  ] as const)('keeps the title slot on the %s variant with a fastener', async (variant) => {
    const el = await mount(new GhCard());
    el.variant = variant;
    el.fastener = 'pin';
    el.innerHTML = '<span slot="title">Heading</span>';
    await el.updateComplete;
    const titleSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="title"]');
    expect(titleSlot?.assignedElements()).toHaveLength(1);
    expect(el.shadowRoot?.querySelector('.fastener-pin')).not.toBeNull();
  });

  it('draws only an outline when flat (no shadow paths)', async () => {
    const el = await mount(new GhCard());
    await setSize(el, 240, 160);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-shadow').length).toBe(0);
  });

  it('emits sketch shadow paths when elevated', async () => {
    const el = await mount(new GhCard());
    el.elevated = true;
    await el.updateComplete;
    await setSize(el, 240, 160);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-shadow').length).toBeGreaterThan(0);
  });

  it('reflects the elevated attribute', async () => {
    const el = await mount(new GhCard());
    el.elevated = true;
    await el.updateComplete;
    expect(el.hasAttribute('elevated')).toBe(true);
  });

  it('accepts an accessible label without error', async () => {
    const el = await mount(new GhCard());
    el.label = 'Profile';
    await el.updateComplete;
    expect(el.label).toBe('Profile');
  });

  describe('link mode', () => {
    const cssText = (): string =>
      ([GhCard.styles] as unknown[])
        .flat(Infinity)
        .map((r) => (r as { cssText: string }).cssText)
        .join('\n');

    it('renders a div surface and no anchor by default', async () => {
      const el = await mount(new GhCard());
      expect(el.shadowRoot?.querySelector('div.content')).not.toBeNull();
      expect(el.shadowRoot?.querySelector('a')).toBeNull();
    });

    it('treats an empty href as no link', async () => {
      const el = await mount(new GhCard());
      el.href = '';
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('a')).toBeNull();
    });

    it('renders the surface as a real anchor with href, target and rel', async () => {
      const el = await mount(new GhCard());
      el.href = '/docs/card';
      el.target = '_blank';
      el.rel = 'noopener';
      el.innerHTML = '<h3 slot="title">Docs</h3><p>Body</p>';
      await el.updateComplete;
      const anchor = el.shadowRoot?.querySelector<HTMLAnchorElement>('a.content');
      expect(anchor).not.toBeNull();
      expect(anchor?.getAttribute('part')).toBe('content');
      expect(anchor?.getAttribute('href')).toBe('/docs/card');
      expect(anchor?.getAttribute('target')).toBe('_blank');
      expect(anchor?.getAttribute('rel')).toBe('noopener');
      expect(el.shadowRoot?.querySelector('div.content')).toBeNull();
      // Both slots live inside the anchor, so the whole surface is the link.
      expect(anchor?.querySelector('slot[name="title"]')).not.toBeNull();
      expect(anchor?.querySelector('slot:not([name])')).not.toBeNull();
    });

    it('omits target and rel when unset', async () => {
      const el = await mount(new GhCard());
      el.href = '/x';
      await el.updateComplete;
      const anchor = el.shadowRoot?.querySelector('a.content');
      expect(anchor?.hasAttribute('target')).toBe(false);
      expect(anchor?.hasAttribute('rel')).toBe(false);
    });

    it('is keyboard-focusable', async () => {
      const el = await mount(new GhCard());
      el.href = '/x';
      await el.updateComplete;
      const anchor = el.shadowRoot?.querySelector<HTMLAnchorElement>('a.content');
      expect(anchor?.tabIndex).toBe(0);
      anchor?.focus();
      expect(el.shadowRoot?.activeElement).toBe(anchor);
    });

    it('forwards focus() and click() to the anchor', async () => {
      const el = await mount(new GhCard());
      el.href = '#card-target';
      await el.updateComplete;
      const anchor = el.shadowRoot?.querySelector<HTMLAnchorElement>('a.content');
      el.focus();
      expect(el.shadowRoot?.activeElement).toBe(anchor);
      let clicked: EventTarget | null = null;
      anchor?.addEventListener('click', (event) => {
        clicked = event.target;
        event.preventDefault();
      });
      el.click();
      expect(clicked).toBe(anchor);
    });

    it('draws the sketch stroke inside the anchor, under the body', async () => {
      const el = await mount(new GhCard());
      el.href = '/x';
      await el.updateComplete;
      await setSize(el, 240, 160);
      const anchor = el.shadowRoot?.querySelector('a.content');
      expect(anchor?.querySelectorAll('svg.sketch path.sketch-stroke').length).toBeGreaterThan(0);
      const sketch = anchor?.querySelector(':scope > svg.sketch');
      expect(sketch?.getAttribute('aria-hidden')).toBe('true');
      expect(cssText()).toMatch(/\.sketch\s*{[^}]*pointer-events: none/);
    });

    it('keeps fasteners and the lined margin inside the anchor', async () => {
      const el = await mount(new GhCard());
      el.href = '/x';
      el.variant = 'lined';
      el.fastener = 'pin';
      await el.updateComplete;
      const anchor = el.shadowRoot?.querySelector('a.content');
      expect(anchor?.querySelector('svg.fastener-pin')).not.toBeNull();
      expect(anchor?.querySelector('.margin-line')).not.toBeNull();
    });

    it('labels the anchor instead of the host', async () => {
      const el = await mount(new GhCard());
      el.href = '/x';
      el.label = 'Card docs';
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('a.content')?.getAttribute('aria-label')).toBe(
        'Card docs',
      );
    });

    it('switches back to a div when href is removed', async () => {
      const el = await mount(new GhCard());
      el.href = '/x';
      await el.updateComplete;
      el.href = undefined;
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('a')).toBeNull();
      expect(el.shadowRoot?.querySelector('div.content')).not.toBeNull();
    });

    it('declares hover stroke, focus ring and lift rules from card tokens', () => {
      const css = cssText();
      expect(css).toMatch(/a\.content:hover > \.sketch\s*{[^}]*var\(--comp-card-stroke-hover\)/);
      expect(css).toMatch(/a\.content:focus-visible\s*{[^}]*var\(--comp-card-focus-ring\)/);
      expect(css).toMatch(/\.content > \.sketch\s*{[^}]*var\(--comp-card-stroke-default\)/);
      expect(css).toMatch(/a\.content:hover\s*{[^}]*translateY/);
      expect(css).toMatch(
        /:host\(\[variant='sticky'\]\) a\.content:hover[^{]*{[^}]*--comp-card-hover-shadow/,
      );
      expect(css).toMatch(/a\.content:focus-visible\s*{[^}]*translateY/);
      // Focus-within lift is scoped to the div surface: a mouse-focused link card stays flat.
      expect(css).not.toMatch(/:host\(\[interactive\]\) \.content:focus-within/);
      expect(css).not.toMatch(/:focus-within\) \.content/);
    });
  });

  describe('paper variants', () => {
    const cssText = (): string =>
      [GhCard.styles]
        .flat(Infinity)
        .map((r) => (r as { cssText: string }).cssText)
        .join('\n');

    it('defaults to plain/neutral/none/none and reflects attributes', async () => {
      const el = await mount(new GhCard());
      expect(el.variant).toBe('plain');
      expect(el.tone).toBe('neutral');
      expect(el.fastener).toBe('none');
      expect(el.tilt).toBe('none');
      expect(el.interactive).toBe(false);
      el.variant = 'lined';
      el.tone = 'warning';
      el.fastener = 'pin';
      el.tilt = 'left';
      el.interactive = true;
      await el.updateComplete;
      expect(el.getAttribute('variant')).toBe('lined');
      expect(el.getAttribute('tone')).toBe('warning');
      expect(el.getAttribute('fastener')).toBe('pin');
      expect(el.getAttribute('tilt')).toBe('left');
      expect(el.hasAttribute('interactive')).toBe(true);
    });

    it.each(['sticky', 'lined'] as const)('%s renders no sketch outline', async (variant) => {
      const el = await mount(new GhCard());
      el.variant = variant;
      await el.updateComplete;
      await setSize(el, 240, 160);
      expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBe(0);
    });

    it('renders an unknown variant as plain', async () => {
      const el = await mount(new GhCard());
      el.setAttribute('variant', 'foo');
      await el.updateComplete;
      await setSize(el, 240, 160);
      expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
    });

    it('elevated on a paper variant draws no sketch shadow', async () => {
      const el = await mount(new GhCard());
      el.variant = 'sticky';
      el.elevated = true;
      await el.updateComplete;
      await setSize(el, 240, 160);
      expect(el.shadowRoot?.querySelectorAll('path.sketch-shadow').length).toBe(0);
    });

    it('styles sticky tone backgrounds from tokens', () => {
      expect(cssText()).toContain(":host([variant='sticky'][tone='warning']) .content");
      expect(cssText()).toContain('var(--comp-card-sticky-bg-warning)');
      expect(cssText()).toContain('var(--comp-card-lined-bg)');
    });

    it('renders an aria-hidden tape mark', async () => {
      const el = await mount(new GhCard());
      el.fastener = 'tape';
      await el.updateComplete;
      const tape = el.shadowRoot?.querySelector('.fastener-tape');
      expect(tape?.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders an aria-hidden pin svg', async () => {
      const el = await mount(new GhCard());
      el.fastener = 'pin';
      await el.updateComplete;
      const pin = el.shadowRoot?.querySelector('svg.fastener-pin');
      expect(pin?.getAttribute('aria-hidden')).toBe('true');
      expect(pin?.getAttribute('focusable')).toBe('false');
      expect(pin?.getAttribute('viewBox')).toBe('0 0 28 30');
    });

    it('draws the pin highlight with its own opacity token', () => {
      expect(cssText()).toMatch(
        /\.pin-highlight\s*{[^}]*fill-opacity: var\(--comp-card-fastener-pin-highlightOpacity\)/,
      );
    });

    it('paints the fastener after the sketch so the outline never covers it', async () => {
      const el = await mount(new GhCard());
      el.fastener = 'pin';
      await el.updateComplete;
      const sketch = el.shadowRoot?.querySelector('svg.sketch');
      const pin = el.shadowRoot?.querySelector('svg.fastener-pin');
      expect(sketch).not.toBeNull();
      expect(sketch?.compareDocumentPosition(pin as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('renders no fastener by default', async () => {
      const el = await mount(new GhCard());
      expect(el.shadowRoot?.querySelector('.fastener-tape, .fastener-pin')).toBeNull();
    });

    it('draws the lined margin line as an aria-hidden element on the inline-start edge', async () => {
      const el = await mount(new GhCard());
      expect(el.shadowRoot?.querySelector('.margin-line')).toBeNull();
      el.variant = 'lined';
      await el.updateComplete;
      const line = el.shadowRoot?.querySelector('.content > .margin-line');
      expect(line?.getAttribute('aria-hidden')).toBe('true');
      // Positioned siblings paint in DOM order, so `.body` must come after the line.
      expect(line?.nextElementSibling?.classList.contains('body')).toBe(true);
      expect(cssText()).toMatch(
        /\.margin-line\s*{[^}]*inset-inline-start: var\(--comp-card-lined-margin-offset\)/,
      );
      // The rules gradient is the only background image; the margin is no longer painted there.
      expect(cssText()).not.toMatch(/linear-gradient\(\s*90deg/);
      el.variant = 'sticky';
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('.margin-line')).toBeNull();
    });

    it('lifts when the host itself is focused', async () => {
      const css = cssText();
      expect(css).toContain(':host([interactive]:focus-within) div.content');
      expect(css).toMatch(
        /:host\(\[interactive\]\[variant='sticky'\]:focus-within\) div\.content,\s*:host\(\[interactive\]\[variant='lined'\]:focus-within\) div\.content\s*{[^}]*box-shadow: var\(--comp-card-hover-shadow\)/,
      );
      const el = await mount(new GhCard());
      el.interactive = true;
      el.tabIndex = 0;
      await el.updateComplete;
      el.focus();
      expect(document.activeElement).toBe(el);
      expect(el.matches(':focus-within')).toBe(true);
      // The rule above is what lifts it: the inner `.content` does not match on host focus.
      expect(el.shadowRoot?.querySelector('.content')?.matches(':focus-within')).toBe(false);
    });

    it('declares interactive lift rules', () => {
      const css = cssText();
      expect(css).toContain('@media (hover: hover)');
      expect(css).toContain(':host([interactive]) .content:hover');
      expect(css).toContain(':host([interactive]) div.content:focus-within');
      expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*{[^}]*transition: none/);
    });
  });
});
