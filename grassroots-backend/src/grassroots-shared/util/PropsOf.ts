// Roughly, given a class, gives you an interface with its attributes.
export type PropsOf<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
