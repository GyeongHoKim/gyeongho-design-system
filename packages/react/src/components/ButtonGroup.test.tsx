import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button.js';
import { ButtonGroup } from './ButtonGroup.js';

describe('ButtonGroup', () => {
  it('renders a labelled group of buttons', () => {
    render(
      <ButtonGroup aria-label="Text alignment">
        <Button>Left</Button>
        <Button>Center</Button>
        <Button>Right</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'Text alignment' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('exposes its orientation', () => {
    render(
      <ButtonGroup orientation="vertical" aria-label="Actions">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical');
  });
});
