const replacer: (this: unknown, key: string, value: unknown) => unknown = (
  key,
  value,
) => {
  if (value instanceof Map) {
    return Array.from(value.entries());
  }
  return value;
};

export function deepLog(prefix: string, ...args: unknown[]): void {
  console.log(prefix, JSON.stringify(args, replacer, 2));
}
