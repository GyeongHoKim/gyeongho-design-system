import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UseSketchParams } from '../sketch/useSketch.js';
import { lightTheme, renderWithTheme } from '../test-utils.js';
import { Badge } from './Badge.js';

// jsdom never fires `onLayout`, so no path is drawn; record what Badge asks
// useSketch for instead.
const calls = vi.hoisted(() => [] as UseSketchParams[]);
vi.mock('../sketch/useSketch.js', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../sketch/useSketch.js')>();
  return {
    ...mod,
    useSketch: (params: UseSketchParams) => {
      calls.push(params);
      return mod.useSketch(params);
    },
  };
});

describe('Badge', () => {
  it('passes the pill radius token to useSketch', () => {
    renderWithTheme(<Badge>New</Badge>);
    expect(calls.at(-1)?.radius).toBe(lightTheme.borderRadii.pill);
  });

  it('renders its label', () => {
    renderWithTheme(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('exposes a testID handle', () => {
    renderWithTheme(
      <Badge testID="my-badge" variant="success">
        Done
      </Badge>,
    );
    expect(screen.getByTestId('my-badge')).toBeInTheDocument();
  });

  it('renders every variant without error', () => {
    renderWithTheme(
      <>
        <Badge variant="neutral">n</Badge>
        <Badge variant="primary">p</Badge>
        <Badge variant="success">s</Badge>
        <Badge variant="warning">w</Badge>
        <Badge variant="danger">d</Badge>
        <Badge variant="info">i</Badge>
      </>,
    );
    for (const label of ['n', 'p', 's', 'w', 'd', 'i']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('applies an accessibility label when provided', () => {
    renderWithTheme(
      <Badge testID="labelled" variant="danger" accessibilityLabel="3 errors">
        3
      </Badge>,
    );
    expect(screen.getByTestId('labelled')).toHaveAttribute('aria-label', '3 errors');
  });
});
