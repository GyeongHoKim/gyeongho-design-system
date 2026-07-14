import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Collapsible } from './Collapsible.js';

describe('Collapsible', () => {
  it('is collapsed by default', () => {
    renderWithTheme(<Collapsible label="Details">Hidden body</Collapsible>);
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.queryByText('Hidden body')).toBeNull();
  });

  it('expands on press', () => {
    renderWithTheme(<Collapsible label="Details">Hidden body</Collapsible>);
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.getByText('Hidden body')).toBeInTheDocument();
  });

  it('reports open state via onOpenChange', () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Collapsible label="Details" onOpenChange={onOpenChange}>
        Hidden body
      </Collapsible>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Collapsible label="Details" disabled onOpenChange={onOpenChange}>
        Hidden body
      </Collapsible>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('honours defaultOpen in dark theme', () => {
    renderWithTheme(
      <Collapsible label="Details" defaultOpen>
        Hidden body
      </Collapsible>,
      darkTheme,
    );
    expect(screen.getByText('Hidden body')).toBeInTheDocument();
  });
});
