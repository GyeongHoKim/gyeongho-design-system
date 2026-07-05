import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { FormField } from './FormField.js';
import { Input } from './Input.js';

describe('FormField', () => {
  it('renders a label above the wrapped control', () => {
    renderWithTheme(
      <FormField label="Email">
        <Input testID="email" />
      </FormField>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByTestId('email')).toBeInTheDocument();
  });

  it('renders no label when unset', () => {
    renderWithTheme(
      <FormField>
        <Input testID="email" />
      </FormField>,
    );
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('renders helper text', () => {
    renderWithTheme(
      <FormField label="Email" helperText="We will never share it">
        <Input testID="email" />
      </FormField>,
    );
    expect(screen.getByText('We will never share it')).toBeInTheDocument();
  });

  it('renders an error message', () => {
    renderWithTheme(
      <FormField label="Email" error="Required">
        <Input testID="email" />
      </FormField>,
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders helper text and an error simultaneously', () => {
    renderWithTheme(
      <FormField label="Email" helperText="We will never share it" error="Required">
        <Input testID="email" />
      </FormField>,
    );
    expect(screen.getByText('We will never share it')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders its children regardless of label/helper/error', () => {
    renderWithTheme(
      <FormField>
        <Input testID="email" />
      </FormField>,
    );
    expect(screen.getByTestId('email')).toBeInTheDocument();
  });
});
