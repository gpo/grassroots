import { Test } from "@nestjs/testing";
import { ContactEntityOutDTO } from "../grassroots-shared/Contact.entity.dto";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Type, ValidationPipe } from "@nestjs/common";
import { PassportModuleImport } from "../auth/PassportModuleImport";
import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { UserEntity } from "../grassroots-shared/User.entity";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";
import { EntityManagerProvider } from "../orm/EntityManager.provider";

let app: NestExpressApplication | undefined = undefined;

export interface TestSpecificDependencies {
  imports?: Type[];
}

export async function getTestApp(
  dependencies: TestSpecificDependencies,
): Promise<{
  app: NestExpressApplication;
}> {
  if (app) {
    return { app };
  }
  const moduleRef = await Test.createTestingModule({
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
            entities: [ContactEntityOutDTO, UserEntity],
            // Allows global transaction management, used for our rollback based testing strategy.
            allowGlobalContext: true,
          };
        },
        inject: [ConfigService],
      }),
      PassportModuleImport(),
      ...(dependencies.imports ?? []),
    ],
  })
    .overrideProvider(EntityManagerProvider)
    .useFactory({
      factory: (entityManager: EntityManager): EntityManagerProvider => {
        const fork = entityManager.fork();
        return new EntityManagerProvider(fork);
      },
      inject: [EntityManager],
    })
    .compile();

  app = moduleRef.createNestApplication<NestExpressApplication>();
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, forbidUnknownValues: true }),
  );
  return { app };
}
