export function keys<T extends object>(obj: T): (keyof T)[] {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Object.keys(obj) as (keyof T)[];
}
