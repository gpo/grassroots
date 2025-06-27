import { PropsOf } from "./PropsOf";

// To use:
// export const check: AssertPropsEqual<A, B> = true;

export type AssertPropsEqual<T, U> =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  (<G>() => G extends PropsOf<T> ? 1 : 2) extends <G>() => G extends PropsOf<U>
    ? 1
    : 2
    ? true
    : never;
