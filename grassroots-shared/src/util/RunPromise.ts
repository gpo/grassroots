export function runPromise<T>(x: Promise<T>): void {
  x.catch((reason: unknown) => {
    throw new Error(String(reason));
  });
}
