import { access, readFile } from "fs/promises";
import * as dotenv from "dotenv";
import { IsNotEmpty, IsPositive, IsUrl, validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";

export class Environment {
  @IsNotEmpty()
  IS_DEBUG!: boolean;

  @IsNotEmpty()
  POSTGRES_USER!: string;

  @IsNotEmpty()
  POSTGRES_PASSWORD!: string;

  // In development, this is the name of a docker container, which doesn't look like a URL.
  @IsNotEmpty()
  POSTGRES_HOST!: string;

  @IsNotEmpty()
  POSTGRES_DATABASE!: string;

  @IsPositive()
  POSTGRES_PORT!: number;

  @IsUrl()
  VITE_BACKEND_HOST!: string;

  @IsUrl()
  VITE_FRONTEND_HOST!: string;

  @IsUrl()
  GOOGLE_AUTH_CALLBACK_URL!: string;

  @IsNotEmpty()
  SESSION_SECRET!: string;

  @IsNotEmpty()
  GOOGLE_CLIENT_ID!: string;

  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET!: string;

  @IsNotEmpty()
  TWILIO_SID!: string;

  @IsNotEmpty()
  TWILIO_APP_SID!: string;

  @IsNotEmpty()
  TWILIO_AUTH_TOKEN!: string;

  @IsNotEmpty()
  TEST_APPROVED_PHONE_NUMBER!: string;

  @IsNotEmpty()
  TWILIO_OUTGOING_NUMBER!: string;

  @IsNotEmpty()
  TWILIO_API_KEY_SID!: string;

  @IsNotEmpty()
  TWILIO_API_KEY_SECRET!: string;

  @IsNotEmpty()
  TWILIO_SYNC_SERVICE_SID!: string;

  @IsNotEmpty()
  WEBHOOK_HOST!: string;

  @IsNotEmpty()
  ENABLE_PHONE_CANVASS_SIMULATION!: boolean;
}

// Earlier files take priority.
function getEnvFilePaths(): string[] {
  if (process.env.GITHUB_ACTIONS == "true") {
    return ["../.env.test.ci", "../.env.test"];
  }
  if (process.env.MODE == "test") {
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
): Promise<Partial<Environment>> {
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
let envVariables: Environment | undefined = undefined;

export async function getEnvVars(): Promise<Environment> {
  if (envVariables) {
    return envVariables;
  }

  // We want earlier files to take priority, so process them last.
  const environmentFilePaths = getEnvFilePaths().reverse();

  // Read all files in parallel using Promise.all
  const filePromises = environmentFilePaths.map(async (filePath) => {
    if (await fileExists(filePath)) {
      return await readSingleEnvironmentFile(filePath);
    }
    return {}; // Missing files are OK - just skip them
  });

  const fileResults = await Promise.all(filePromises);

  const allEnvironmentVariables: Partial<Environment> = {};

  for (const result of fileResults) {
    Object.assign(allEnvironmentVariables, result);
  }

  envVariables = plainToInstance(Environment, allEnvironmentVariables, {
    enableImplicitConversion: true,
  });

  // In test contexts, we may not have all environment variables present.
  const skipMissingProperties =
    process.env.GITHUB_ACTIONS == "true" ||
    process.env.CI === "true" ||
    process.env.VITEST === "true";

  const errors = validateSync(envVariables, {
    skipMissingProperties,
  });
  if (errors.length > 0) {
    throw new Error("Invalid environment variables: " + errors.join("\n"));
  }

  return envVariables;
}
