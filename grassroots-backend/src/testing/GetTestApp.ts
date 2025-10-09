import { Test } from "@nestjs/testing";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Type } from "@nestjs/common";
import { PassportModuleImport } from "../auth/PassportModuleImport.js";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";
import { overrideEntityManagerForTest } from "./OverrideEntityManagerForTest.js";
import { MockSessionGuard } from "./MockAuthGuard.js";
import { SessionGuard } from "../auth/Session.guard.js";
import mikroORMConfig from "./../mikro-orm.config.js";
import { getEnvVars } from "../GetEnvVars.js";

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
  const envVars = await getEnvVars();
  let builder = Test.createTestingModule({
    imports: [
      MikroOrmModule.forRootAsync({
        driver: PostgreSqlDriver,
        useFactory: (): MikroOrmModuleOptions => {
          return {
            driver: PostgreSqlDriver,
            host: envVars.POSTGRES_HOST,
            port: envVars.POSTGRES_PORT,
            user: envVars.POSTGRES_USER,
            password: envVars.POSTGRES_PASSWORD,
            dbName: envVars.POSTGRES_DATABASE,
            entities: mikroORMConfig.entities,
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
  return { app };
}
