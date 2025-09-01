import { IsString, IsNumber, IsUrl, Min, Max } from "class-validator";
import { Transform } from "class-transformer";
import { cast } from "../grassroots-shared/util/Cast";

/**
 * Environment configuration values with validation decorators
 */
export class AppConfigValues {
  // Database configuration
  @IsString()
  POSTGRES_HOST!: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @Transform(({ value }: { value: unknown }) => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(
        `POSTGRES_PORT must be a valid number, got: ${String(value)}`,
      );
    }
    return num;
  })
  POSTGRES_PORT!: number;

  @IsString()
  POSTGRES_USER!: string;

  @IsString()
  POSTGRES_PASSWORD!: string;

  @IsString()
  POSTGRES_DATABASE!: string;

  // Authentication configuration
  @IsString()
  SESSION_SECRET!: string;

  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  @IsUrl({
    protocols: ["http", "https"],
    require_protocol: true,
  })
  GOOGLE_AUTH_CALLBACK_URL!: string;
}

/**
 * Application configuration class
 * Usage: appConfig.values.POSTGRES_HOST
 */
export class AppConfig {
  public readonly values: AppConfigValues;

  constructor(environmentVariables: Record<string, string | undefined>) {
    const requiredEnvVars = [
      "POSTGRES_HOST",
      "POSTGRES_PORT",
      "POSTGRES_USER",
      "POSTGRES_PASSWORD",
      "POSTGRES_DATABASE",
      "SESSION_SECRET",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_AUTH_CALLBACK_URL",
    ] as const;

    for (const key of requiredEnvVars) {
      const value = environmentVariables[key];
      if (typeof value !== "string" || value.length === 0) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }

    const configData = {
      POSTGRES_HOST: String(environmentVariables.POSTGRES_HOST),
      POSTGRES_PORT: Number(environmentVariables.POSTGRES_PORT),
      POSTGRES_USER: String(environmentVariables.POSTGRES_USER),
      POSTGRES_PASSWORD: String(environmentVariables.POSTGRES_PASSWORD),
      POSTGRES_DATABASE: String(environmentVariables.POSTGRES_DATABASE),
      SESSION_SECRET: String(environmentVariables.SESSION_SECRET),
      GOOGLE_CLIENT_ID: String(environmentVariables.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_SECRET: String(environmentVariables.GOOGLE_CLIENT_SECRET),
      GOOGLE_AUTH_CALLBACK_URL: String(
        environmentVariables.GOOGLE_AUTH_CALLBACK_URL,
      ),
    };

    // Validate and transform using existing cast utility
    this.values = cast(AppConfigValues, configData);
  }

  static fromProcessEnv(): AppConfig {
    return new AppConfig(process.env);
  }

  static fromEnvironment(env: Record<string, string | undefined>): AppConfig {
    return new AppConfig(env);
  }
}
