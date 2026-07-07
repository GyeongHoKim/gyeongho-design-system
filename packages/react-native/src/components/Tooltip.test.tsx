import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Tooltip } from './Tooltip.js';

describe('Tooltip', () => {
  it('renders its trigger and exposes the content as a hint', () => {
    renderWithTheme(
      <Tooltip content="More info" testID="tt">
        <Text>Help</Text>
      </Tooltip>,
    );
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('toggles the bubble on press', () => {
    renderWithTheme(
      <Tooltip content="More info">
        <Text>Help</Text>
      </Tooltip>,
    );
    expect(screen.queryByText('More info')).toBeNull();
    fireEvent.click(screen.getByText('Help'));
    expect(screen.getByText('More info')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Help'));
    expect(screen.queryByText('More info')).toBeNull();
  });
});
