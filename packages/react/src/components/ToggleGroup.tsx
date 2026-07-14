import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Toggle } from './Toggle.js';

/** One item in a {@link ToggleGroup}. */
export interface ToggleGroupItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Accessible name when `label` is not plain text (e.g. an icon). */
  'aria-label'?: string;
}

interface ToggleGroupBaseProps {
  /** The toggle items. */
  items: ToggleGroupItem[];
  /** Layout axis. Defaults to `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical';
  /** Disables the whole group. */
  disabled?: boolean;
  /** Accessible label for the group. */
  'aria-label'?: string;
}

interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  type: 'single';
  /** Controlled selected value (empty string = none). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  type: 'multiple';
  /** Controlled selected values. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

const c = tokens.comp.toggleGroup;

/**
 * A hand-drawn group of {@link Toggle}s with roving tabindex. In `single` mode
 * one value is pressed at a time (empty = none); in `multiple` mode any subset
 * can be pressed. Rendered as `role="group"`; only one item is tabbable and the
 * arrow keys (Home/End) move focus along `orientation`. Spacing comes from
 * `@ghds/tokens` (`comp.toggleGroup.*`); each item's sketch look comes from
 * `Toggle`.
 */
export function ToggleGroup(props: ToggleGroupProps) {
  const { items, orientation = 'horizontal', disabled = false } = props;
  const ariaLabel = props['aria-label'];

  const isControlled = props.value !== undefined;
  const [internalSingle, setInternalSingle] = useState<string>(
    props.type === 'single' ? (props.defaultValue ?? '') : '',
  );
  const [internalMultiple, setInternalMultiple] = useState<string[]>(
    props.type === 'multiple' ? (props.defaultValue ?? []) : [],
  );

  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);

  const enabledIndexes = useMemo(
    () =>
      items
        .map((item, i) => ({ item, i }))
        .filter((x) => !x.item.disabled)
        .map((x) => x.i),
    [items],
  );

  const isPressed = useCallback(
    (value: string): boolean => {
      if (props.type === 'single') {
        const current = isControlled ? (props.value ?? '') : internalSingle;
        return current === value;
      }
      const current = isControlled ? (props.value ?? []) : internalMultiple;
      return current.includes(value);
    },
    [props, isControlled, internalSingle, internalMultiple],
  );

  const handleToggle = (value: string) => {
    if (props.type === 'single') {
      const current = isControlled ? (props.value ?? '') : internalSingle;
      const next = current === value ? '' : value;
      if (!isControlled) {
        setInternalSingle(next);
      }
      props.onValueChange?.(next);
    } else {
      const current = isControlled ? (props.value ?? []) : internalMultiple;
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (!isControlled) {
        setInternalMultiple(next);
      }
      props.onValueChange?.(next);
    }
  };

  const focusAt = (index: number) => {
    setFocusIndex(index);
    itemsRef.current[index]?.focus();
  };

  const moveFocus = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) {
      return;
    }
    const currentPos = enabledIndexes.indexOf(focusIndex);
    const startPos = currentPos === -1 ? 0 : currentPos;
    const nextPos = (startPos + direction + enabledIndexes.length) % enabledIndexes.length;
    const next = enabledIndexes[nextPos];
    if (next !== undefined) {
      focusAt(next);
    }
  };

  const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case nextKey:
        event.preventDefault();
        moveFocus(1);
        break;
      case prevKey:
        event.preventDefault();
        moveFocus(-1);
        break;
      case 'Home':
        event.preventDefault();
        if (enabledIndexes[0] !== undefined) {
          focusAt(enabledIndexes[0]);
        }
        break;
      case 'End': {
        event.preventDefault();
        const last = enabledIndexes[enabledIndexes.length - 1];
        if (last !== undefined) {
          focusAt(last);
        }
        break;
      }
    }
  };

  // The roving tab stop: the focused item if enabled, else the first enabled one.
  const tabStop = enabledIndexes.includes(focusIndex) ? focusIndex : (enabledIndexes[0] ?? -1);

  const rootStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: c.gap,
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: `role="group"` is the correct generic grouping for a set of related toggle buttons; a fieldset would impose unwanted form semantics
    <div
      role="group"
      aria-label={ariaLabel}
      data-orientation={orientation}
      style={rootStyle}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <Toggle
          key={item.value}
          ref={(el) => {
            itemsRef.current[index] = el;
          }}
          pressed={isPressed(item.value)}
          disabled={disabled || item.disabled}
          tabIndex={index === tabStop ? 0 : -1}
          aria-label={item['aria-label']}
          onPressedChange={() => handleToggle(item.value)}
          onFocus={() => setFocusIndex(index)}
        >
          {item.label}
        </Toggle>
      ))}
    </div>
  );
}
