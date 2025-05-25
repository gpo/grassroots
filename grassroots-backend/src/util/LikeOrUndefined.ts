export function LikeOrUndefined<T>(
  k: keyof T,
  v: string | undefined,
): Partial<Record<keyof T, { $like: string }>> {
  if (v === undefined) {
    return {};
  }
  const result: Partial<Record<keyof T, { $like: string }>> = {};
  result[k] = { $like: `%${v}%` };
  return result;
}
