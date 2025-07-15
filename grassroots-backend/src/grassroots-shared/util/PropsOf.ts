// Roughly, given a class, gives you an interface with its attributes.

export type PropsOf<T> = {
  // Keys must be strings or numbers, this excludes unique symbols like [__brand].
  // Note that this is about property names, not values.
  [K in keyof T as K extends string | number
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      T[K] extends Function
      ? never
      : K
    : never]: T[K];
};
