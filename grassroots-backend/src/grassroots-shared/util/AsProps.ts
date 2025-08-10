import { PropsOf } from "./TypeUtils";

export function asProps<T>(t: T): PropsOf<T> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return t as PropsOf<T>;
}
