interface FetchResponse<T, E> {
  data?: T;
  error?: E;
  response: Response;
}

export function getFetchResultOrThrow<T, E>(
  fetchResult: FetchResponse<T, E>,
): T {
  if (fetchResult.data !== undefined) {
    return fetchResult.data;
  }
  if (fetchResult.error === undefined) {
    throw new Error("Fetch result has neither data nor an error");
  }
  throw new Error(JSON.stringify(fetchResult.error));
}
