export function partition<T, Key>(
  array: T[],
  predicate: (value: T) => Key,
): Map<Key, T[]> {
  const result = new Map<Key, T[]>();

  for (const item of array) {
    const key = predicate(item);
    const ar = result.get(key) ?? [];
    ar.push(item);
    result.set(key, ar);
  }

  return result;
}
