import { access, readFile } from "fs/promises";
import * as dotenv from "dotenv";
import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  validateSync,
} from "class-validator";
import { plainToInstance } from "class-transformer";

export class Environment {
  @IsOptional()
  @IsBooleanString()
  IS_DEBUG!: string | undefined;

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

  @IsString()
  VALID_LOGIN_EMAIL_REGEX!: string;

  // Separated by ;
  @IsString()
  @IsOptional()
  TWILIO_TEST_NUMBERS!: string | undefined;
}

type VarSources = Record<keyof Environment, string>;

// Earlier files take priority.
function getEnvFilePaths(): string[] {
  if (process.env.GITHUB_ACTIONS == "true") {
    return ["/config/.env.test.ci", "/config/.env.test"];
  }
  if (process.env.MODE == "test") {
    return ["/config/.env.test.local", "/config/.env.test"];
  }
  return ["/config/.env.development.local", "/config/.env.development", "/config/.env.production"];
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
let varSources: VarSources | undefined = undefined;

const SAFE_TO_LOG: (keyof Environment)[] = [
  "IS_DEBUG",
  "POSTGRES_USER",
  "POSTGRES_HOST",
  "POSTGRES_DATABASE",
  "POSTGRES_PORT",
  "VITE_BACKEND_HOST",
  "VITE_FRONTEND_HOST",
  "GOOGLE_AUTH_CALLBACK_URL",
  "GOOGLE_CLIENT_ID",
  "TWILIO_SID",
  "TWILIO_APP_SID",
  "TEST_APPROVED_PHONE_NUMBER",
  "TWILIO_OUTGOING_NUMBER",
  "TWILIO_API_KEY_SID",
  "TWILIO_SYNC_SERVICE_SID",
  "WEBHOOK_HOST",
  "ENABLE_PHONE_CANVASS_SIMULATION",
  "VALID_LOGIN_EMAIL_REGEX",
];

function logEnvVars(envVariables: Environment, varSources: VarSources): void {
  const blob: Partial<
    Record<keyof Environment, { value?: string; source: string }>
  > = {};

  for (const keyUntyped of Object.keys(envVariables)) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const key = keyUntyped as keyof Environment;
    if (SAFE_TO_LOG.includes(key)) {
      blob[key] = { value: String(envVariables[key]), source: varSources[key] };
    } else {
      blob[key] = { source: varSources[key] };
    }
  }

  console.log(blob);
}

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
  const allVariableSources: Partial<VarSources> = {};

  for (let i = 0; i < fileResults.length; ++i) {
    const result = fileResults[i];
    if (result === undefined) {
      continue;
    }
    Object.assign(allEnvironmentVariables, result);
    const filePath = environmentFilePaths[i];
    for (const key of Object.keys(result)) {
      // TODO: we need a typesafe Object.keys utility.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      allVariableSources[key as keyof Environment] = filePath;
    }
  }

  envVariables = plainToInstance(Environment, allEnvironmentVariables, {
    enableImplicitConversion: true,
  });
  // TODO: make this safer.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  varSources = allVariableSources as VarSources;

  logEnvVars(envVariables, varSources);

  // In test contexts, we may not have all environment variables present.
  const skipMissingProperties =
    process.env.GITHUB_ACTIONS == "true" ||
    process.env.CI === "true" ||
    process.env.VITEST === "true";

  const errors = validateSync(envVariables, { skipMissingProperties });
  if (errors.length > 0) {
    throw new Error("Invalid environment variables: " + errors.join("\n"));
  }

  return envVariables;
}
