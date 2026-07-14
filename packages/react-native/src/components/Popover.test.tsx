import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Popover } from './Popover.js';

describe('Popover', () => {
  it('renders a collapsed trigger', () => {
    renderWithTheme(
      <Popover triggerLabel="More" trigger={<Text>More</Text>} testID="pop">
        <Text>Panel body</Text>
      </Popover>,
    );
    expect(screen.getByTestId('pop')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Panel body')).toBeNull();
  });

  it('opens on press and shows the panel', () => {
    renderWithTheme(
      <Popover triggerLabel="More" trigger={<Text>More</Text>} testID="pop">
        <Text>Panel body</Text>
      </Popover>,
    );
    fireEvent.click(screen.getByTestId('pop'));
    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });

  it('reports open state via onOpenChange', () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Popover
        triggerLabel="More"
        trigger={<Text>More</Text>}
        onOpenChange={onOpenChange}
        testID="pop"
      >
        <Text>Panel body</Text>
      </Popover>,
    );
    fireEvent.click(screen.getByTestId('pop'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('does not open when disabled (dark theme)', () => {
    renderWithTheme(
      <Popover triggerLabel="More" trigger={<Text>More</Text>} disabled testID="pop">
        <Text>Panel body</Text>
      </Popover>,
      darkTheme,
    );
    fireEvent.click(screen.getByTestId('pop'));
    expect(screen.queryByText('Panel body')).toBeNull();
  });
});
