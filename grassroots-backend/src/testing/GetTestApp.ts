import { Test } from "@nestjs/testing";
import { ContactEntity } from "../contacts/entities/Contact.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Type, ValidationPipe } from "@nestjs/common";
import { PassportModuleImport } from "../auth/PassportModuleImport";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { UserEntity } from "../users/User.entity";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";
import { overrideEntityManagerForTest } from "./OverrideEntityManagerForTest";
import { MockSessionGuard } from "../../test/MockAuthGuard";
import { SessionGuard } from "../auth/Session.guard";

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
  let builder = Test.createTestingModule({
    imports: [
      MikroOrmModule.forRootAsync({
        imports: [ConfigModule],
        driver: PostgreSqlDriver,
        useFactory: (config: ConfigService): MikroOrmModuleOptions => {
          return {
            driver: PostgreSqlDriver,
            host: config.get<string>("POSTGRES_HOST"),
            port: config.get<number>("POSTGRES_PORT"),
            user: config.get<string>("POSTGRES_USER"),
            password: config.get<string>("POSTGRES_PASSWORD"),
            dbName: config.get<string>("POSTGRES_DATABASE"),
            entities: [ContactEntity, UserEntity],
            // Allows global transaction management, used for our rollback based testing strategy.
            allowGlobalContext: true,
          };
        },
        inject: [ConfigService],
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
