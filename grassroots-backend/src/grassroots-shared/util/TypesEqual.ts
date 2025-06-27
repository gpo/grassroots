import { PropsOf } from "./PropsOf";

// To use:
// export const check: AssertPropsEqual<A, B> = true;

export type AssertPropsEqual<T, U> =
  PropsOf<T> extends PropsOf<U>
    ? PropsOf<U> extends PropsOf<T>
      ? true
      : never
    : never;
