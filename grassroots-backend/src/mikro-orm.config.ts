/* eslint-disable check-file/filename-naming-convention */
import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { UserEntity } from "./users/User.entity";
import { ContactEntity } from "./contacts/entities/Contact.entity";
import { OrganizationEntity } from "./organizations/Organization.entity";
import * as dotenv from "dotenv";
import { readFileSync, existsSync } from "fs";
import { getEnvFilePaths } from "./GetEnvFilePaths";

/**
 * Loads and combines environment variables from multiple .env files
 * Earlier files in the list take priority (same as dotenv-flow behavior)
 */
function loadEnvironmentVariables(): Record<string, string> {
  // Reversed so that earlier files take priority, to align with the ConfigModule
  const envFiles = getEnvFilePaths().reverse();
  let combinedEnv: Record<string, string> = {};

  for (const filePath of envFiles) {
    if (existsSync(filePath)) {
      try {
        const fileContent = readFileSync(filePath, "utf8");
        const parsedEnv = dotenv.parse(fileContent);
        combinedEnv = { ...combinedEnv, ...parsedEnv };
      } catch (error) {
        console.warn(`Warning: Could not read env file ${filePath}:`, error);
      }
    }
  }

  return combinedEnv;
}

// Load environment configuration
const envConfig = loadEnvironmentVariables();

export default defineConfig({
  metadataCache: { enabled: false },
  driver: PostgreSqlDriver,
  entities: [ContactEntity, UserEntity, OrganizationEntity],
  host: envConfig.POSTGRES_HOST,
  port: Number(envConfig.POSTGRES_PORT),
  user: envConfig.POSTGRES_USER,
  password: envConfig.POSTGRES_PASSWORD,
  dbName: envConfig.POSTGRES_DATABASE,
  debug: true,
});
