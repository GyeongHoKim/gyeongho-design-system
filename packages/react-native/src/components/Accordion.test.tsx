import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Accordion, type AccordionItem } from './Accordion.js';

const ITEMS: AccordionItem[] = [
  { value: 'a', label: 'Section A', content: 'Body A' },
  { value: 'b', label: 'Section B', content: 'Body B' },
];

describe('Accordion', () => {
  it('renders collapsed by default', () => {
    renderWithTheme(<Accordion items={ITEMS} testID="acc" />);
    expect(screen.getByText('Section A')).toBeInTheDocument();
    expect(screen.queryByText('Body A')).toBeNull();
  });

  it('expands a section on press', () => {
    renderWithTheme(<Accordion items={ITEMS} />);
    fireEvent.click(screen.getByText('Section A'));
    expect(screen.getByText('Body A')).toBeInTheDocument();
  });

  it('keeps at most one open in single mode', () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <Accordion items={ITEMS} type="single" defaultValue={['a']} onValueChange={onValueChange} />,
    );
    expect(screen.getByText('Body A')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Section B'));
    expect(onValueChange).toHaveBeenCalledWith(['b']);
  });

  it('adds to the open set in multiple mode', () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <Accordion
        items={ITEMS}
        type="multiple"
        defaultValue={['a']}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByText('Section B'));
    expect(onValueChange).toHaveBeenCalledWith(['a', 'b']);
  });
});
