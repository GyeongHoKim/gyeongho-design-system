import { afterEach, describe, expect, it } from 'vitest';
import { GhButtonGroup } from '../components/button-group.js';
import { cleanup, mount } from './fixture.js';

describe('gh-button-group', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-button-group')).toBe(GhButtonGroup);
  });

  it('exposes group semantics with a label and orientation', async () => {
    const el = await mount(new GhButtonGroup());
    el.label = 'Text style';
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    const internals = (el as any).internals as ElementInternals;
    expect(internals.role).toBe('group');
    expect(internals.ariaLabel).toBe('Text style');
    expect(internals.ariaOrientation).toBe('horizontal');
    el.orientation = 'vertical';
    await el.updateComplete;
    expect(internals.ariaOrientation).toBe('vertical');
  });

  it('renders a default slot for grouped controls', async () => {
    const el = await mount(new GhButtonGroup());
    expect(el.shadowRoot?.querySelector('slot')).not.toBeNull();
  });
});
