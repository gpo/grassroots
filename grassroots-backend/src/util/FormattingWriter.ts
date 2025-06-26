import { readFile, writeFile } from "fs/promises";
import * as prettier from "prettier";

export interface WriteFormattedResult {
  noChange: boolean;
}

let prettierOptions: prettier.Options | null = null;

export async function writeFormatted(options: {
  filePath: string;
  onlyIfChanged?: boolean;
  text: string;
}): Promise<WriteFormattedResult> {
  prettierOptions ??= await prettier.resolveConfig("../.prettier.rc");

  const formatted = await prettier.format(options.text, {
    ...prettierOptions,
    filepath: options.filePath,
  });

  if (options.onlyIfChanged === true) {
    let oldText: string | undefined = undefined;
    try {
      oldText = await readFile(options.filePath, "utf8");
    } catch {
      /* File doesn't exist */
    }
    if (oldText == formatted) {
      return { noChange: true };
    }
  }

  await writeFile(options.filePath, formatted);
  return { noChange: false };
}
