import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Attachment } from './Attachment.js';

describe('Attachment', () => {
  it('renders the name and metadata', () => {
    renderWithTheme(<Attachment name="report.pdf" meta="2.4 MB" testID="chip" />);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
  });

  it('renders without metadata', () => {
    renderWithTheme(<Attachment name="notes.txt" testID="chip" />);
    expect(screen.getByText('notes.txt')).toBeInTheDocument();
  });

  it('renders a labelled remove button and fires onRemove', () => {
    const onRemove = vi.fn();
    renderWithTheme(<Attachment name="report.pdf" onRemove={onRemove} />);
    const button = screen.getByLabelText('Remove report.pdf');
    fireEvent.click(button);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('uses a custom remove label when provided', () => {
    renderWithTheme(<Attachment name="report.pdf" onRemove={() => {}} removeLabel="Detach file" />);
    expect(screen.getByLabelText('Detach file')).toBeInTheDocument();
  });

  it('does not render a remove button without onRemove', () => {
    renderWithTheme(<Attachment name="report.pdf" />);
    expect(screen.queryByLabelText('Remove report.pdf')).not.toBeInTheDocument();
  });
});
