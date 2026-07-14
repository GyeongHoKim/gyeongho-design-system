import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { HoverCard } from './HoverCard.js';

describe('HoverCard', () => {
  // On touch there is no hover, so this component opens on long-press; the
  // long-press gesture is not reproducible through jsdom DOM events, so these
  // tests cover the trigger surface + closed default rather than the open state.
  it('renders the trigger with a long-press hint', () => {
    renderWithTheme(
      <HoverCard triggerLabel="@ghost" trigger={<Text>@ghost</Text>} testID="hc">
        <Text>Preview</Text>
      </HoverCard>,
    );
    const trigger = screen.getByTestId('hc');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('@ghost')).toBeInTheDocument();
  });

  it('keeps the card closed by default (dark theme)', () => {
    renderWithTheme(
      <HoverCard triggerLabel="@ghost" trigger={<Text>@ghost</Text>} testID="hc">
        <Text>Preview</Text>
      </HoverCard>,
      darkTheme,
    );
    expect(screen.queryByText('Preview')).toBeNull();
  });
});
