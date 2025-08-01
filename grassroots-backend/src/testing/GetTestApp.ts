import { Test } from "@nestjs/testing";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Type, ValidationPipe } from "@nestjs/common";
import { PassportModuleImport } from "../auth/PassportModuleImport";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";
import { overrideEntityManagerForTest } from "./OverrideEntityManagerForTest";
import { MockSessionGuard } from "./MockAuthGuard";
import { SessionGuard } from "../auth/Session.guard";
import createMikroORMConfig from "./../mikro-orm.config";
import { getEnvironmentVariables } from "../GetEnvironmentVariables";

let app: NestExpressApplication | undefined = undefined;

export interface TestSpecificDependencies {
  imports?: Type[];
  overrideAuthGuard?: boolean;
}

export async function getTestApp(
  dependencies: TestSpecificDependencies,
): Promise<{
  app: NestExpressApplication;
}> {
  if (app) {
    return { app };
  }

  // Get the config to extract entities
  const mikroORMConfigData = await createMikroORMConfig();

  // Load environment variables using your function
  const envVars = await getEnvironmentVariables();

  let builder = Test.createTestingModule({
    imports: [
      MikroOrmModule.forRootAsync({
        driver: PostgreSqlDriver,
        useFactory: (): MikroOrmModuleOptions => {
          return {
            driver: PostgreSqlDriver,
            host: envVars.POSTGRES_HOST,
            port: Number(envVars.POSTGRES_PORT),
            user: envVars.POSTGRES_USER,
            password: envVars.POSTGRES_PASSWORD,
            dbName: envVars.POSTGRES_DATABASE,
            entities: mikroORMConfigData.entities,
            // Allows global transaction management, used for our rollback based testing strategy.
            allowGlobalContext: true,
          };
        },
      }),
      PassportModuleImport(),
      ...(dependencies.imports ?? []),
    ],
  });
  builder = overrideEntityManagerForTest(builder);
  if (dependencies.overrideAuthGuard === true) {
    builder = builder.overrideProvider(SessionGuard).useClass(MockSessionGuard);
  }
  const moduleRef = await builder.compile();

  app = moduleRef.createNestApplication<NestExpressApplication>();

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, forbidUnknownValues: true }),
  );
  return { app };
}
