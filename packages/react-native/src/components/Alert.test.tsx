import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Alert } from './Alert.js';

describe('Alert', () => {
  it('renders the title and body', () => {
    renderWithTheme(
      <Alert variant="success" title="Saved" testID="a">
        Your changes are saved.
      </Alert>,
    );
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Your changes are saved.')).toBeInTheDocument();
  });

  it('exposes an alert role for the danger variant', () => {
    renderWithTheme(
      <Alert variant="danger" testID="a">
        Boom
      </Alert>,
    );
    expect(screen.getByTestId('a')).toHaveAttribute('role', 'alert');
  });

  it('calls onDismiss from the dismiss button', () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <Alert variant="info" onDismiss={onDismiss}>
        Note
      </Alert>,
    );
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
