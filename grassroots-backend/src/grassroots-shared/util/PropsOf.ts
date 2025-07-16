// Roughly, given a class, gives you an interface with its attributes.
// Recursively does this with all included objects.
// Excludes __brand,  making it easier to use this with branded types.

export type PropsOf<T> = {
  // Only include keys which are strings or numbers, excluding symbols like [__brand].
  [K in keyof T as K extends string | number
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      T[K] extends Function
      ? never // Exclude function values.
      : K
    : never /* Excluding symbols */]: undefined extends T[K] /* Checking for optional properties */
    ? PropsValue<T[K]> | undefined /* Handle optional properties */
    : PropsValue<T[K]> /* Handle required properties */;
};

// Maps from a value type to it's type only including properties.
// Handles: arrays of objects, arrays of primitives, objects, and primitives.
type PropsValue<V> = V extends (infer U)[] // This is an array.
  ? // We need to use [U] extends [object] instead of U extends object to prevent distributing over
    // union types. See https://shaky.sh/ts-distributive-conditional-types/#how-to-avoid-distributing-a-union.
    [U] extends [object]
    ? PropsOf<U>[] // The values are objects, recurse.
    : U[] // The values are primitives, use them.
  : V extends object // This is not an array.
    ? PropsOf<V> // This is an object, recurse.
    : V; // This is a primitive, use it.
