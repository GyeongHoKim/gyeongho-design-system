import { afterEach, describe, expect, it } from 'vitest';
import { GhCallout, type GhCalloutVariant } from '../components/callout.js';
import { cleanup, mount, setSize } from './fixture.js';

function internalsOf(el: GhCallout): ElementInternals {
  return (el as unknown as { internals: ElementInternals }).internals;
}

describe('gh-callout', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-callout')).toBe(GhCallout);
  });

  it('defaults to the info variant with a reflected attribute', async () => {
    const el = await mount(new GhCallout());
    expect(el.variant).toBe('info');
    expect(el.getAttribute('variant')).toBe('info');
    expect(el.shadowRoot?.querySelector('gh-icon')?.getAttribute('name')).toBe('info');
  });

  it.each<[GhCalloutVariant, string]>([
    ['info', 'info'],
    ['tip', 'star'],
    ['warning', 'warning'],
  ])('maps the %s variant to the %s icon', async (variant, icon) => {
    const el = await mount(new GhCallout());
    el.variant = variant;
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe(variant);
    expect(el.shadowRoot?.querySelector('gh-icon')?.getAttribute('name')).toBe(icon);
  });

  it('colours the outline and icon from the variant comp tokens', () => {
    const css = GhCallout.styles
      .flat()
      .map((style) => String(style))
      .join('\n');
    for (const variant of ['info', 'tip', 'warning']) {
      expect(css).toContain(`var(--comp-callout-stroke-${variant})`);
      expect(css).toContain(`var(--comp-callout-icon-${variant})`);
    }
    expect(css).toContain('var(--comp-callout-text-heading)');
    expect(css).toContain('var(--comp-callout-text-body)');
    expect(css).toContain('var(--comp-callout-bg)');
  });

  it('renders the heading only when set', async () => {
    const el = await mount(new GhCallout());
    expect(el.shadowRoot?.querySelector('.heading')).toBeNull();
    el.heading = 'Recommended fonts';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.heading')?.textContent).toBe('Recommended fonts');
  });

  it('projects body content through the default slot', async () => {
    const el = new GhCallout();
    el.innerHTML = '<p>Load the fonts yourself.</p>';
    await mount(el);
    const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('.body slot');
    expect(slot).not.toBeNull();
    const assigned = slot?.assignedElements() ?? [];
    expect(assigned).toHaveLength(1);
    expect(assigned[0]?.textContent).toBe('Load the fonts yourself.');
  });

  it('draws a sketch outline once measured', async () => {
    const el = await mount(new GhCallout());
    await setSize(el, 320, 96);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });

  it('is a static note, not a live region', async () => {
    const el = await mount(new GhCallout());
    el.variant = 'warning';
    await el.updateComplete;
    expect(internalsOf(el).role).toBe('note');
  });

  it('has no dismiss affordance', async () => {
    const el = new GhCallout();
    el.setAttribute('dismissible', '');
    await mount(el);
    expect(el.shadowRoot?.querySelector('button')).toBeNull();
    expect(el.shadowRoot?.querySelector('.close')).toBeNull();
    expect(el.shadowRoot?.querySelector('gh-icon[name="close"]')).toBeNull();
    expect('dismissible' in el).toBe(false);
  });
});
