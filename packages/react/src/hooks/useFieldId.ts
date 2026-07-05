import { useId } from 'react';

/** Resolves a stable field id: the caller-supplied `id`, or a generated one. */
export function useFieldId(id?: string): string {
  const reactId = useId();
  return id ?? reactId;
}
