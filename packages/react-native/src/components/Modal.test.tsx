import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Modal } from './Modal.js';

describe('Modal', () => {
  it('does not render its content when closed', () => {
    renderWithTheme(
      <Modal open={false} onClose={() => {}} title="Settings">
        <Text>Body</Text>
      </Modal>,
    );
    expect(screen.queryByText('Body')).toBeNull();
  });

  it('renders a dialog with the title and body when open', () => {
    renderWithTheme(
      <Modal open onClose={() => {}} title="Settings">
        <Text>Body</Text>
      </Modal>,
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('closes when the scrim is tapped', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Modal open onClose={onClose} title="Settings">
        <Text>Body</Text>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
