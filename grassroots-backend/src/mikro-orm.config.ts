/* eslint-disable check-file/filename-naming-convention */
import { defineConfig, PostgreSqlDriver, Options } from "@mikro-orm/postgresql";
import { UserEntity } from "./users/User.entity";
import { ContactEntity } from "./contacts/entities/Contact.entity";
import { OrganizationEntity } from "./organizations/Organization.entity";
import * as dotenv from "dotenv";
import { readFile, access } from "fs/promises";
import { getEnvFilePaths } from "./GetEnvFilePaths";

/**
 * Checks if a file exists and is accessible
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads and parses a single .env file
 */
async function readSingleEnvironmentFile(
  filePath: string,
): Promise<Record<string, string>> {
  try {
    const fileContent = await readFile(filePath, "utf8");
    return dotenv.parse(fileContent);
  } catch (error) {
    // If file exists but can't be read/parsed, that's a real problem
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to read environment file ${filePath}: ${errorMessage}`,
    );
  }
}

/**
 * Loads environment variables from multiple .env files in parallel
 * Earlier files in the list take priority over later files
 */
async function loadAllEnvironmentVariables(): Promise<Record<string, string>> {
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

  return allEnvironmentVariables;
}

/**
 * Creates the MikroORM configuration with async environment loading
 */
async function createMikroOrmConfig(): Promise<Options> {
  const environmentConfig = await loadAllEnvironmentVariables();

  return defineConfig({
    metadataCache: { enabled: false },
    driver: PostgreSqlDriver,
    entities: [ContactEntity, UserEntity, OrganizationEntity],
    host: environmentConfig.POSTGRES_HOST,
    port: Number(environmentConfig.POSTGRES_PORT),
    user: environmentConfig.POSTGRES_USER,
    password: environmentConfig.POSTGRES_PASSWORD,
    dbName: environmentConfig.POSTGRES_DATABASE,
    debug: true,
  });
}

// Export the Promise - consumers will need to await it
export default createMikroOrmConfig();
