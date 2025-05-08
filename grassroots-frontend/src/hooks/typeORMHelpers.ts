// TypeORM considers an empty string to match all records, which we often don't want.
// This helper takes an object containing query values (e.g., from a search form) and replaces all empty
// strings with undefined.
export function replaceEmptyStringWithUndefined<T>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    result[key] = obj[key] == "" ? undefined : obj[key];
  }
  return result;
}
