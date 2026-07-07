import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Avatar, initialsFrom } from './Avatar.js';

describe('initialsFrom', () => {
  it('takes the first and last word initials', () => {
    expect(initialsFrom('Ada Lovelace')).toBe('AL');
  });
  it('uses a single initial for one word', () => {
    expect(initialsFrom('Grace')).toBe('G');
  });
  it('returns empty for blank input', () => {
    expect(initialsFrom('   ')).toBe('');
  });
});

describe('Avatar', () => {
  it('renders initials when no src is given', () => {
    renderWithTheme(<Avatar name="Ada Lovelace" testID="a" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('applies the name as an accessibility label', () => {
    renderWithTheme(<Avatar name="Ada Lovelace" testID="labelled" />);
    expect(screen.getByTestId('labelled')).toHaveAttribute('aria-label', 'Ada Lovelace');
  });

  it('renders every size without error', () => {
    renderWithTheme(
      <>
        <Avatar name="A" size="sm" testID="sm" />
        <Avatar name="B" size="md" testID="md" />
        <Avatar name="C" size="lg" testID="lg" />
      </>,
    );
    for (const id of ['sm', 'md', 'lg']) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
  });
});
