// Roughly, given a class, gives you an interface with its attributes.
// Recursively does this with all included objects.

// Exclude these keys which are used for internal bookkeeping.
type ExcludedKeys = "__DTOBrand" | "__entityBrand" | "__caslSubjectType";

export type PropsOf<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T as T[K] extends Function
    ? never // Exclude function values.
    : K extends ExcludedKeys
      ? never
      : K]: undefined extends T[K] /* Checking for optional properties */
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
