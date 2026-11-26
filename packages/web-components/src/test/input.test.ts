import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhButton } from '../components/button.js';
import { GhInput } from '../components/input.js';
import { cleanup, mount, setSize } from './fixture.js';

function typeInto(el: GhInput, value: string): void {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) {
    throw new Error('input not rendered');
  }
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

describe('gh-input', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-input')).toBe(GhInput);
  });

  it('renders a native input', async () => {
    const el = await mount(new GhInput());
    expect(el.shadowRoot?.querySelector('input')).not.toBeNull();
  });

  it('associates a visible label with the input', async () => {
    const el = await mount(new GhInput());
    el.label = 'Email';
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('label');
    const input = el.shadowRoot?.querySelector('input');
    expect(label?.getAttribute('for')).toBe(input?.id);
  });

  it('falls back to an aria-label from the placeholder', async () => {
    const el = await mount(new GhInput());
    el.placeholder = 'Search';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('input')?.getAttribute('aria-label')).toBe('Search');
  });

  it('updates value and emits input on typing', async () => {
    const el = await mount(new GhInput());
    const onInput = vi.fn();
    el.addEventListener('input', onInput);
    typeInto(el, 'hello');
    expect(el.value).toBe('hello');
    expect(onInput).toHaveBeenCalled();
  });

  it('is form-associated (resolves its owning form)', async () => {
    const form = document.createElement('form');
    const el = new GhInput();
    el.name = 'email';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    typeInto(el, 'a@b.com');
    expect(el.form).toBe(form);
    expect(el.value).toBe('a@b.com');
  });

  describe('implicit submission (Enter)', () => {
    async function mountInForm(): Promise<{ el: GhInput; form: HTMLFormElement }> {
      const form = document.createElement('form');
      const el = new GhInput();
      form.append(el);
      document.body.append(form);
      await el.updateComplete;
      return { el, form };
    }

    function pressKey(el: GhInput, init: KeyboardEventInit): KeyboardEvent {
      const input = el.shadowRoot?.querySelector('input');
      if (!input) {
        throw new Error('input not rendered');
      }
      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        composed: true,
        cancelable: true,
        ...init,
      });
      input.dispatchEvent(event);
      return event;
    }

    /** Records each submit's submitter and stops the (unimplemented) navigation. */
    function captureSubmits(form: HTMLFormElement): (HTMLElement | null)[] {
      const submitters: (HTMLElement | null)[] = [];
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitters.push((event as SubmitEvent).submitter);
      });
      return submitters;
    }

    /** Implicit submission runs after dispatch, like the native default action. */
    const afterDispatch = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

    afterEach(() => {
      for (const form of document.querySelectorAll('form')) {
        form.remove();
      }
    });

    it('requests submit on the owning form when Enter is pressed', async () => {
      const { el, form } = await mountInForm();
      const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(requestSubmit).toHaveBeenCalledTimes(1);
    });

    it('clicks the default button, so the form submits with it as the submitter', async () => {
      const { el, form } = await mountInForm();
      const first = document.createElement('button');
      first.type = 'submit';
      first.name = 'intent';
      first.value = 'search';
      const second = document.createElement('button');
      second.type = 'submit';
      form.append(first, second);
      const onClick = vi.fn();
      first.addEventListener('click', onClick);
      const submitters = captureSubmits(form);
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(submitters).toEqual([first]);
    });

    it('does not submit when a click listener on the default button cancels it', async () => {
      const { el, form } = await mountInForm();
      const button = document.createElement('button');
      button.type = 'submit';
      button.addEventListener('click', (event) => event.preventDefault());
      form.append(button);
      const submitters = captureSubmits(form);
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(submitters).toEqual([]);
    });

    it('treats an image input as the default button', async () => {
      const { el, form } = await mountInForm();
      const image = document.createElement('input');
      image.type = 'image';
      const button = document.createElement('button');
      button.type = 'submit';
      form.append(image, button);
      const onImageClick = vi.fn();
      const onButtonClick = vi.fn();
      image.addEventListener('click', onImageClick);
      button.addEventListener('click', onButtonClick);
      captureSubmits(form);
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(onImageClick).toHaveBeenCalledTimes(1);
      expect(onButtonClick).not.toHaveBeenCalled();
    });

    it('does not submit when the default button is disabled', async () => {
      const { el, form } = await mountInForm();
      const button = document.createElement('button');
      button.type = 'submit';
      button.disabled = true;
      form.append(button);
      const requestSubmit = vi.spyOn(form, 'requestSubmit');
      const submitters = captureSubmits(form);
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(requestSubmit).not.toHaveBeenCalled();
      expect(submitters).toEqual([]);
    });

    it('does not submit when the default button is in a disabled fieldset', async () => {
      const { el, form } = await mountInForm();
      const fieldset = document.createElement('fieldset');
      fieldset.disabled = true;
      const button = document.createElement('button');
      button.type = 'submit';
      fieldset.append(button);
      form.append(fieldset);
      const requestSubmit = vi.spyOn(form, 'requestSubmit');
      const submitters = captureSubmits(form);
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(requestSubmit).not.toHaveBeenCalled();
      expect(submitters).toEqual([]);
    });

    it('submits without a submitter when a gh-button comes before a native button', async () => {
      const { el, form } = await mountInForm();
      const ghButton = new GhButton();
      ghButton.type = 'submit';
      const native = document.createElement('button');
      native.type = 'submit';
      form.append(ghButton, native);
      await ghButton.updateComplete;
      const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(requestSubmit).toHaveBeenCalledTimes(1);
      expect(requestSubmit.mock.calls[0]?.[0]).toBeUndefined();
    });

    it('fires click on a default gh-button and submits unless it is cancelled', async () => {
      const { el, form } = await mountInForm();
      const ghButton = new GhButton();
      ghButton.type = 'submit';
      form.append(ghButton);
      await ghButton.updateComplete;
      const onClick = vi.fn();
      ghButton.addEventListener('click', onClick);
      const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(requestSubmit).toHaveBeenCalledTimes(1);

      requestSubmit.mockClear();
      ghButton.addEventListener('click', (event) => event.preventDefault());
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(requestSubmit).not.toHaveBeenCalled();
    });

    it('does not submit when the default gh-button is disabled', async () => {
      const { el, form } = await mountInForm();
      const ghButton = new GhButton();
      ghButton.type = 'submit';
      ghButton.disabled = true;
      form.append(ghButton);
      await ghButton.updateComplete;
      const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(requestSubmit).not.toHaveBeenCalled();
    });

    it('does not submit while an IME composition is in progress', async () => {
      const { el, form } = await mountInForm();
      const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});
      pressKey(el, { key: 'Enter', isComposing: true });
      await afterDispatch();
      expect(requestSubmit).not.toHaveBeenCalled();
    });

    it('does not submit for other keys', async () => {
      const { el, form } = await mountInForm();
      const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});
      pressKey(el, { key: 'a' });
      await afterDispatch();
      expect(requestSubmit).not.toHaveBeenCalled();
    });

    it('does not submit when a listener already handled Enter', async () => {
      const { el, form } = await mountInForm();
      const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});
      el.addEventListener('keydown', (event) => event.preventDefault());
      pressKey(el, { key: 'Enter' });
      await afterDispatch();
      expect(requestSubmit).not.toHaveBeenCalled();
    });

    it('does nothing outside a form', async () => {
      const el = await mount(new GhInput());
      pressKey(el, { key: 'Enter' });
      await expect(afterDispatch()).resolves.toBeUndefined();
    });
  });

  describe('type validity', () => {
    it('is invalid when an email field holds a malformed address', async () => {
      const el = await mount(new GhInput());
      el.type = 'email';
      await el.updateComplete;
      typeInto(el, 'abc');
      await el.updateComplete;
      expect(el.validity.valid).toBe(false);
    });

    it('is valid for a well-formed address and for an empty optional field', async () => {
      const el = await mount(new GhInput());
      el.type = 'email';
      await el.updateComplete;
      expect(el.validity.valid).toBe(true);
      typeInto(el, 'a@b.com');
      await el.updateComplete;
      expect(el.validity.valid).toBe(true);
    });

    it('re-checks the value when the type changes', async () => {
      const el = await mount(new GhInput());
      typeInto(el, 'abc');
      await el.updateComplete;
      expect(el.validity.valid).toBe(true);
      el.type = 'email';
      await el.updateComplete;
      expect(el.validity.valid).toBe(false);
    });
  });

  it('reports a valueMissing validity error when required and empty', async () => {
    const el = await mount(new GhInput());
    el.required = true;
    await el.updateComplete;
    expect(el.validity.valueMissing).toBe(true);
    typeInto(el, 'x');
    await el.updateComplete;
    expect(el.validity.valueMissing).toBe(false);
  });

  it('clears its value via the form reset callback', async () => {
    const el = await mount(new GhInput());
    typeInto(el, 'text');
    expect(el.value).toBe('text');
    el.formResetCallback();
    await el.updateComplete;
    expect(el.value).toBe('');
  });

  it('mirrors the form-disabled callback to the disabled property', async () => {
    const el = await mount(new GhInput());
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(el.disabled).toBe(true);
  });

  it('draws a sketchy outline once sized', async () => {
    const el = await mount(new GhInput());
    await setSize(el, 220, 44);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });
});
