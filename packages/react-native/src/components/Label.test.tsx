import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Label } from './Label.js';

describe('Label', () => {
  it('renders its text', () => {
    renderWithTheme(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates with a field via nativeID', () => {
    renderWithTheme(<Label nativeID="email-label">Email</Label>);
    expect(screen.getByText('Email')).toHaveAttribute('id', 'email-label');
  });

  it('renders the disabled variant in dark theme', () => {
    renderWithTheme(
      <Label disabled testID="lbl">
        Email
      </Label>,
      darkTheme,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
});
