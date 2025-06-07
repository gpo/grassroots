import { Test } from "@nestjs/testing";
import { ContactEntityOutDTO } from "../grassroots-shared/Contact.entity.dto";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Provider, Type, ValidationPipe } from "@nestjs/common";
import { AuthModule } from "../auth/Auth.module";
import { PassportModuleImport } from "../auth/PassportModuleImport";
import { UsersModule } from "../users/Users.module";
import { AuthService } from "../auth/Auth.service";
import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { UserEntity } from "../grassroots-shared/User.entity";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";
import { EntityManagerProvider } from "../orm/EntityManager.provider";
import { EntityManagerModule } from "../orm/EntityManager.module";

let app: NestExpressApplication | undefined = undefined;

export interface TestSpecificDependencies {
  providers?: Provider[];
  controllers?: Type[];
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
      ConfigModule.forRoot({
        envFilePath: ["../.env.test.local", "../.env.test"],
        isGlobal: false,
      }),
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
      AuthModule,
      UsersModule,
      PassportModuleImport(),
      EntityManagerModule,
    ],
    controllers: dependencies.controllers ?? [],
    providers: [...(dependencies.providers ?? []), AuthService, AuthService],
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
