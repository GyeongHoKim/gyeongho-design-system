import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from './Item.js';

describe('Item', () => {
  it('renders composed media, content and actions', () => {
    render(
      <Item>
        <ItemMedia>
          <span data-testid="media">◆</span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Invoices</ItemTitle>
          <ItemDescription>Billing history</ItemDescription>
        </ItemContent>
        <ItemActions>
          <button type="button">Open</button>
        </ItemActions>
      </Item>,
    );
    expect(screen.getByTestId('media')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Billing history')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('draws a decorative sketch border only for the outline variant', () => {
    const { container: plain } = render(<Item>x</Item>);
    expect(plain.querySelector('svg')).toBeNull();

    const { container: outline } = render(<Item variant="outline">x</Item>);
    const svg = outline.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(outline.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('forwards a role to the root element', () => {
    render(
      <Item role="listitem" aria-label="row">
        x
      </Item>,
    );
    expect(screen.getByRole('listitem', { name: 'row' })).toBeInTheDocument();
  });
});
