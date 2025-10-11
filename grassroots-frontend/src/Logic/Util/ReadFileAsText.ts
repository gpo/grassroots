export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (): void => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unexpected result type"));
      }
    };

    reader.onerror = (): void => {
      reject(reader.error ?? new Error("Unable to read file " + file.name));
    };

    reader.readAsText(file);
  });
}
