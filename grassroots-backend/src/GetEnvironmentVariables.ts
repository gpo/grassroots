import { access, readFile } from "fs/promises";
import * as dotenv from "dotenv";

function getEnvFilePaths(): string[] {
  if (process.env.GITHUB_ACTIONS === "true") {
    return ["../.env.test.ci", "../.env.test"];
  }
  if (process.env.MODE === "test") {
    return ["../.env.test"];
  }
  return ["../.env.development.local", "../.env.development"];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readSingleEnvironmentFile(
  filePath: string,
): Promise<Record<string, string>> {
  try {
    const fileContent = await readFile(filePath, "utf8");
    const parsedEnv = dotenv.parse(fileContent);
    return parsedEnv;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to read environment file ${filePath}: ${errorMessage}`,
    );
  }
}

// Cache environment variables.
let envVariables: Record<string, string> | undefined = undefined;

/**
 * Loads environment variables from multiple .env files in parallel
 * Earlier files in the list take priority over later files
 */
export async function getEnvironmentVariables(): Promise<
  Record<string, string>
> {
  if (envVariables) {
    return envVariables;
  }

  const environmentFilePaths = getEnvFilePaths();

  // Read all files in parallel using Promise.all
  const filePromises = environmentFilePaths.map(async (filePath) => {
    if (!filePath || !(await fileExists(filePath))) {
      return null; // Missing files are OK - just skip them
    }

    // If file exists, it MUST be parseable - throw if not
    const variables = await readSingleEnvironmentFile(filePath);
    return { filePath, variables };
  });

  const fileResults = await Promise.all(filePromises);

  let allEnvironmentVariables: Record<string, string> = {};

  // Process results in order to maintain priority (earlier files override later files)
  for (const result of fileResults) {
    if (result?.variables) {
      allEnvironmentVariables = {
        ...result.variables,
        ...allEnvironmentVariables,
      };
    }
  }

  envVariables = allEnvironmentVariables;
  return envVariables;
}
