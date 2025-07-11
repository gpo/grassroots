export function fail(message?: string): never {
  if (message === undefined) {
    throw new Error("Failure");
  } else {
    throw new Error(message);
  }
}
