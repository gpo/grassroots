export function notNull<T>(x: T | null, msg: string): T {
  if (x === null) {
    throw new Error(msg);
  }
  return x;
}
