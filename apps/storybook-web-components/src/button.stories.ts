import { expect, fn, userEvent } from 'storybook/test';
import '@ghds/web-components/button';
import type { GhButtonVariant } from '@ghds/web-components/button';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface ButtonArgs {
  variant: GhButtonVariant;
  disabled: boolean;
  label: string;
  onClick: (event: Event) => void;
}

function requireEl<T extends Element>(root: ParentNode | null, selector: string): T {
  const found = root?.querySelector<T>(selector);
  if (!found) {
    throw new Error(`expected to find ${selector}`);
  }
  return found;
}

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-button
      variant=${args.variant}
      ?disabled=${args.disabled}
      @click=${args.onClick}
      >${args.label}</gh-button
    >`,
  args: {
    variant: 'primary',
    disabled: false,
    label: 'Sketchy Button',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'danger', 'neutral'] },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Primary: Story = {};

export const Danger: Story = { args: { variant: 'danger', label: 'Delete' } };

export const Neutral: Story = { args: { variant: 'neutral', label: 'Cancel' } };

export const Disabled: Story = { args: { disabled: true, label: 'Disabled' } };

export const FiresClick: Story = {
  name: 'Interaction: fires click',
  play: async ({ canvasElement, args }) => {
    const host = requireEl(canvasElement, 'gh-button');
    const inner = requireEl<HTMLButtonElement>(host.shadowRoot, 'button');
    await userEvent.click(inner);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const DisabledBlocksClick: Story = {
  name: 'Interaction: disabled blocks click',
  args: { disabled: true, label: 'Disabled' },
  play: async ({ canvasElement, args }) => {
    const host = requireEl(canvasElement, 'gh-button');
    const inner = requireEl<HTMLButtonElement>(host.shadowRoot, 'button');
    await expect(inner.disabled).toBe(true);
    await userEvent.click(inner, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/**
 * `href` renders a real `<a href>` (crawlable, right-clickable, keyboard-focusable)
 * with the same sketch outline and variant colours. `target`/`rel` are forwarded.
 */
export const AsLink: Story = {
  name: 'As link (href)',
  // The render only reads `variant`; hide the meta's disabled/label/onClick controls.
  parameters: { controls: { include: ['variant'] } },
  render: (args) =>
    html`<gh-button variant=${args.variant} href="#getting-started">Get Started →</gh-button>
      <gh-button
        variant="neutral"
        href="https://example.com/"
        target="_blank"
        rel="noopener noreferrer"
        >External link</gh-button
      >`,
  play: async ({ canvasElement }) => {
    const [internal, external] = Array.from(canvasElement.querySelectorAll('gh-button'));
    const anchor = requireEl<HTMLAnchorElement>(internal?.shadowRoot ?? null, 'a');
    await expect(anchor.getAttribute('href')).toBe('#getting-started');
    await expect(internal?.shadowRoot?.querySelector('button')).toBeNull();
    const externalAnchor = requireEl<HTMLAnchorElement>(external?.shadowRoot ?? null, 'a');
    await expect(externalAnchor.getAttribute('target')).toBe('_blank');
    await expect(externalAnchor.getAttribute('rel')).toBe('noopener noreferrer');
  },
};

/** `disabled` wins over `href`: a disabled `<button>` renders, never a navigable link. */
export const DisabledLink: Story = {
  name: 'As link (href) — disabled',
  parameters: { controls: { disable: true } },
  render: () => html`<gh-button href="#getting-started" disabled>Get Started →</gh-button>`,
  play: async ({ canvasElement }) => {
    const host = requireEl(canvasElement, 'gh-button');
    await expect(host.shadowRoot?.querySelector('a')).toBeNull();
    const inner = requireEl<HTMLButtonElement>(host.shadowRoot, 'button');
    await expect(inner.disabled).toBe(true);
  },
};
