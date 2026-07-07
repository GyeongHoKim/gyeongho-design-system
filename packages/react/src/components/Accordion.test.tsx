import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion, type AccordionItem } from './Accordion.js';

const ITEMS: AccordionItem[] = [
  { value: 'a', label: 'Section A', content: <p>Body A</p> },
  { value: 'b', label: 'Section B', content: <p>Body B</p> },
  { value: 'c', label: 'Section C', content: <p>Body C</p> },
];

describe('Accordion', () => {
  it('renders collapsed headers with aria-expanded=false by default', () => {
    render(<Accordion items={ITEMS} />);
    expect(screen.getByRole('button', { name: 'Section A' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByText('Body A')).toBeNull();
  });

  it('expands a section on click', async () => {
    render(<Accordion items={ITEMS} />);
    await userEvent.click(screen.getByRole('button', { name: 'Section A' }));
    expect(screen.getByRole('button', { name: 'Section A' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Body A')).toBeInTheDocument();
  });

  it('keeps at most one section open in single mode', async () => {
    render(<Accordion items={ITEMS} type="single" defaultValue={['a']} />);
    expect(screen.getByText('Body A')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Section B' }));
    expect(screen.getByText('Body B')).toBeInTheDocument();
    expect(screen.queryByText('Body A')).toBeNull();
  });

  it('allows several open in multiple mode', async () => {
    render(<Accordion items={ITEMS} type="multiple" defaultValue={['a']} />);
    await userEvent.click(screen.getByRole('button', { name: 'Section B' }));
    expect(screen.getByText('Body A')).toBeInTheDocument();
    expect(screen.getByText('Body B')).toBeInTheDocument();
  });

  it('moves focus between headers with arrow keys', async () => {
    render(<Accordion items={ITEMS} />);
    const first = screen.getByRole('button', { name: 'Section A' });
    first.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Section B' })).toHaveFocus();
  });
});
