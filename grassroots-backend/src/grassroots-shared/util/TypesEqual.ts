import { PropsOf } from "./PropsOf";

export type AssertPropsEqual<T, U> =
  PropsOf<T> extends PropsOf<U>
    ? PropsOf<U> extends PropsOf<T>
      ? true
      : never
    : never;
