/* eslint-disable check-file/filename-naming-convention */
import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { UserEntity } from "./users/User.entity";
import { ContactEntity } from "./contacts/entities/Contact.entity";
import { OrganizationEntity } from "./organizations/Organization.entity";
import * as dotenv from "dotenv";
import { readFileSync, existsSync } from "fs";
import { getEnvFilePaths } from "./GetEnvFilePaths";

/**
 * Reads and parses a single .env file
 * Returns null if file cannot be read
 */
function readSingleEnvironmentFile(filePath: string): Record<string, string> {
  try {
    const fileContent = readFileSync(filePath, "utf8");
    return dotenv.parse(fileContent);
  } catch (error) {
    // If file exists but can't be read/parsed
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to read environment file ${filePath}: ${errorMessage}`,
    );
  }
}

/**
 * Loads environment variables from multiple .env files
 * Earlier files in the list take priority over later files
 */
function loadAllEnvironmentVariables(): Record<string, string> {
  const environmentFilePaths = getEnvFilePaths();
  let allEnvironmentVariables: Record<string, string> = {};

  for (const currentFilePath of environmentFilePaths) {
    if (!currentFilePath || !existsSync(currentFilePath)) {
      continue; // Missing files are OK - just skip them
    }

    // If file exists, it MUST be parseable - throw if not
    const variablesFromThisFile = readSingleEnvironmentFile(currentFilePath);

    // Earlier files override later files
    allEnvironmentVariables = {
      ...variablesFromThisFile,
      ...allEnvironmentVariables,
    };
  }

  return allEnvironmentVariables;
}

const environmentConfig = loadAllEnvironmentVariables();

export default defineConfig({
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
