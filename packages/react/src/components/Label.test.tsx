import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Label } from './Label.js';

describe('Label', () => {
  it('renders its text', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates with a control via htmlFor and forwards clicks', async () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    await userEvent.click(screen.getByText('Email'));
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('marks itself disabled', () => {
    render(<Label disabled>Email</Label>);
    expect(screen.getByText('Email')).toHaveAttribute('data-disabled', 'true');
  });
});
