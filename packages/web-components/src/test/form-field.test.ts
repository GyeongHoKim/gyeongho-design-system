import { afterEach, describe, expect, it } from 'vitest';
import { GhFormField } from '../components/form-field.js';
import { cleanup, mount } from './fixture.js';

describe('gh-form-field', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-form-field')).toBe(GhFormField);
  });

  it('renders a label associated via `for`', async () => {
    const el = new GhFormField();
    el.for = 'email';
    el.label = 'Email';
    await mount(el);
    const label = el.shadowRoot?.querySelector('label');
    expect(label?.textContent).toBe('Email');
    expect(label?.getAttribute('for')).toBe('email');
  });

  it('renders no label when unset', async () => {
    const el = await mount(new GhFormField());
    expect(el.shadowRoot?.querySelector('label')).toBeNull();
  });

  it('renders helper text', async () => {
    const el = new GhFormField();
    el.helperText = "We'll never share it";
    await mount(el);
    expect(el.shadowRoot?.querySelector('.helper')?.textContent).toBe("We'll never share it");
  });

  it('renders an announced error', async () => {
    const el = new GhFormField();
    el.error = 'Required';
    await mount(el);
    const error = el.shadowRoot?.querySelector('.error');
    expect(error?.textContent).toBe('Required');
    expect(error?.getAttribute('role')).toBe('alert');
  });

  it('renders helper text and an error simultaneously', async () => {
    const el = new GhFormField();
    el.helperText = "We'll never share it";
    el.error = 'Required';
    await mount(el);
    expect(el.shadowRoot?.querySelector('.helper')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.error')).not.toBeNull();
  });

  it('derives helperId/errorId from `for`', async () => {
    const el = new GhFormField();
    el.for = 'email';
    await mount(el);
    expect(el.helperId).toBe('email-helper');
    expect(el.errorId).toBe('email-error');
  });

  it('falls back to an internally generated id when `for` is unset', async () => {
    const el = await mount(new GhFormField());
    expect(el.helperId).toMatch(/^gh-form-field-\d+-helper$/);
    expect(el.errorId).toMatch(/^gh-form-field-\d+-error$/);
  });

  it('renders a slot for the wrapped control', async () => {
    const el = new GhFormField();
    el.innerHTML = '<input />';
    await mount(el);
    expect(el.shadowRoot?.querySelector('slot')).not.toBeNull();
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('auto-assigns `for` as the id of the slotted control when it has none', async () => {
    const el = new GhFormField();
    el.for = 'email';
    el.innerHTML = '<input />';
    await mount(el);
    expect(el.querySelector('input')?.id).toBe('email');
  });

  it('does not override a slotted control that already has its own id', async () => {
    const el = new GhFormField();
    el.for = 'email';
    el.innerHTML = '<input id="already-set" />';
    await mount(el);
    expect(el.querySelector('input')?.id).toBe('already-set');
  });

  it('wires aria-describedby/aria-invalid onto the slotted control', async () => {
    const el = new GhFormField();
    el.for = 'email';
    el.helperText = "We'll never share it";
    el.error = 'Required';
    el.innerHTML = '<input />';
    await mount(el);
    const input = el.querySelector('input');
    expect(input?.getAttribute('aria-describedby')).toBe('email-helper email-error');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
  });

  it('clears aria-describedby/aria-invalid when helperText/error are unset', async () => {
    const el = new GhFormField();
    el.for = 'email';
    el.error = 'Required';
    el.innerHTML = '<input />';
    await mount(el);
    expect(el.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');

    el.error = '';
    await el.updateComplete;
    const input = el.querySelector('input');
    expect(input?.getAttribute('aria-invalid')).toBeNull();
    expect(input?.getAttribute('aria-describedby')).toBeNull();
  });

  it('re-wires onto a dynamically swapped slotted control', async () => {
    const el = new GhFormField();
    el.for = 'email';
    el.error = 'Required';
    el.innerHTML = '<input id="first" />';
    await mount(el);
    expect(el.querySelector('#first')?.getAttribute('aria-invalid')).toBe('true');

    el.innerHTML = '<input id="second" />';
    // slotchange fires asynchronously as a microtask after light DOM mutates.
    await Promise.resolve();
    await el.updateComplete;
    expect(el.querySelector('#second')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('associates the label with the slotted control even when `for` is unset', async () => {
    const el = new GhFormField();
    el.label = 'Email';
    el.innerHTML = '<input />';
    await mount(el);
    const input = el.querySelector('input');
    const label = el.shadowRoot?.querySelector('label');
    expect(input?.id).not.toBe('');
    expect(label?.getAttribute('for')).toBe(input?.id);
  });

  it('refreshes the assigned control id when `for` changes after mount', async () => {
    const el = new GhFormField();
    el.for = 'first-id';
    el.innerHTML = '<input />';
    await mount(el);
    expect(el.querySelector('input')?.id).toBe('first-id');

    el.for = 'second-id';
    await el.updateComplete;
    expect(el.querySelector('input')?.id).toBe('second-id');
  });

  it('merges its own describedby ids into an existing aria-describedby instead of replacing it', async () => {
    const el = new GhFormField();
    el.for = 'email';
    el.error = 'Required';
    el.innerHTML = '<input aria-describedby="external-hint" />';
    await mount(el);
    const input = el.querySelector('input');
    expect(input?.getAttribute('aria-describedby')).toBe('external-hint email-error');

    el.error = '';
    await el.updateComplete;
    expect(el.querySelector('input')?.getAttribute('aria-describedby')).toBe('external-hint');
  });

  it('preserves an externally set aria-invalid when it never asserts an error itself', async () => {
    const el = new GhFormField();
    el.for = 'email';
    el.innerHTML = '<input aria-invalid="true" />';
    await mount(el);
    expect(el.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
  });
});
