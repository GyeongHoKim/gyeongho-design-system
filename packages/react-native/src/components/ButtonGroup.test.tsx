import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Button } from './Button.js';
import { ButtonGroup } from './ButtonGroup.js';

describe('ButtonGroup', () => {
  it('renders its member buttons', () => {
    renderWithTheme(
      <ButtonGroup accessibilityLabel="Actions" testID="grp">
        <Button label="Save" />
        <Button label="Cancel" variant="danger" />
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('is exposed as a labelled toolbar', () => {
    renderWithTheme(
      <ButtonGroup accessibilityLabel="Actions" testID="grp">
        <Button label="Save" />
      </ButtonGroup>,
    );
    expect(screen.getByTestId('grp')).toHaveAttribute('aria-label', 'Actions');
  });

  it('renders a column orientation in dark theme', () => {
    renderWithTheme(
      <ButtonGroup orientation="column" testID="grp">
        <Button label="One" />
        <Button label="Two" />
      </ButtonGroup>,
      darkTheme,
    );
    expect(screen.getByTestId('grp')).toBeInTheDocument();
  });
});
