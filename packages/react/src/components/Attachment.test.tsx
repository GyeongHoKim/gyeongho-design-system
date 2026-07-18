import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Attachment } from './Attachment.js';

describe('Attachment', () => {
  it('renders the name and metadata', () => {
    render(<Attachment name="report.pdf" meta="2.4 MB" />);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
  });

  it('paints a decorative sketch surface', () => {
    const { container } = render(<Attachment name="a.txt" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a remove button that calls onRemove', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Attachment name="report.pdf" onRemove={onRemove} />);
    const button = screen.getByRole('button', { name: 'Remove report.pdf' });
    await user.click(button);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('omits the remove button when onRemove is not given', () => {
    render(<Attachment name="report.pdf" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
