export function runPromise<T>(x: Promise<T>, debug: boolean): void {
  const stack = debug ? new Error().stack : undefined;
  x.catch(function runPromiseCatch(reason: unknown) {
    throw new Error(
      String(reason) + (stack !== undefined ? "stack:\n" + stack : ""),
    );
  });
}
