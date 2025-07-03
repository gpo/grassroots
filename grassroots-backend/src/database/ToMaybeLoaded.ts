import { BaseEntity, Collection } from "@mikro-orm/core";
import { MaybeLoaded } from "../grassroots-shared/MaybeLoaded";

export function toMaybeLoaded<
  K extends object,
  T extends BaseEntity | Collection<K>,
>(x: T | undefined): MaybeLoaded<T> {
  if (x === undefined) {
    return undefined;
  }
  return x.isInitialized() ? x : "unloaded";
}
