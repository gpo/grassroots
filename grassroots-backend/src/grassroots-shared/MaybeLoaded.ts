// MaybeLoaded<T> represents a relation that may or may not be loaded.
// We use a raw type instead of a class because it allows type narrowing (see "isLoading")
// and vastly simplifies serialization / deserialization.

// Expected usage:
// Create via `toMaybeLoaded(entity)` (outside the shared folder since it relies on mikroorm entities)).
// const maybeEntity = toMaybeLoaded(entity);
// Convert to a dto via map or mapItems.
// const maybe = MaybeLoaded.map(maybeEntity, (x) => x.toDTO());
// Check if it's loaded with the type guard `isLoaded`
//
// if MaybeLoaded.isLoaded(maybe) {
//   if (maybe === undefined) {
//   } else {
//   }
// }
//

export type MaybeLoaded<T> = T | "unloaded" | undefined;

export function isLoaded<T>(maybe: MaybeLoaded<T>): maybe is T | undefined {
  return maybe !== "unloaded";
}

export function map<T, G>(
  maybe: MaybeLoaded<T>,
  f: (x: T) => G,
): MaybeLoaded<G> {
  if (!isLoaded(maybe)) {
    return "unloaded";
  }
  if (maybe === undefined) {
    return undefined;
  }
  return f(maybe);
}

export function mapItems<T extends object, G>(
  maybe: MaybeLoaded<T[]>,
  f: (x: T) => G,
): MaybeLoaded<G[]> {
  if (!isLoaded(maybe)) {
    return "unloaded";
  }
  if (maybe === undefined) {
    return undefined;
  }
  return maybe.map((x) => f(x));
}

export function getOrThrow<T>(x: MaybeLoaded<T>): T | undefined {
  if (!isLoaded(x)) {
    throw new Error("Attempt to get unloaded relation");
  }
  return x;
}
