import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactEntityOutDTO } from "../grassroots-shared/Contact.entity.dto";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource, QueryRunner } from "typeorm";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Provider, Type, ValidationPipe } from "@nestjs/common";
import { QueryRunnerProvider } from "../providers/QueryRunnerProvider";
import { AuthModule } from "../auth/Auth.module";
import { PassportModuleImport } from "../auth/PassportModuleImport";
import { UsersModule } from "../users/Users.module";
import { AppModule } from "../App.module";
import { AuthService } from "../auth/Auth.service";

let app: NestExpressApplication | undefined = undefined;
let queryRunner: QueryRunner | undefined = undefined;

export interface TestSpecificDependencies {
  providers?: Provider[];
  controllers?: Type[];
}

export async function getTestApp(
  dependencies: TestSpecificDependencies,
): Promise<{
  app: NestExpressApplication;
  queryRunner: QueryRunner;
}> {
  if (app) {
    if (!queryRunner) {
      throw new Error("Query runner failed to initialize for tests.");
    }
    return { app, queryRunner };
  }
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: "../.env.test",
        isGlobal: true,
      }),
      // https://stackoverflow.com/questions/52570212/nestjs-using-configservice-with-typeormmodule
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          return {
            type: "postgres",
            host: "localhost",
            port: config.get<number>("POSTGRES_PORT"),
            username: config.get<string>("POSTGRES_USER"),
            password: config.get<string>("POSTGRES_PASSWORD"),
            database: config.get<string>("POSTGRES_DB"),
            entities: [ContactEntityOutDTO],
            synchronize: true,
            connectionTimeout: 30000, // Increased timeout to 30 seconds
          };
        },
        inject: [ConfigService],
      }),
      TypeOrmModule.forFeature([ContactEntityOutDTO]),
      AuthModule,
      UsersModule,
      PassportModuleImport(),
      AppModule,
    ],
    controllers: dependencies.controllers ?? [],
    providers: [
      ...(dependencies.providers ?? []),
      {
        provide: QueryRunnerProvider,
        useFactory: (dataSource: DataSource): QueryRunnerProvider => {
          queryRunner = dataSource.createQueryRunner();
          return new QueryRunnerProvider(queryRunner);
        },
        inject: [DataSource],
      },
      AuthService,
    ],
  }).compile();

  app = moduleRef.createNestApplication<NestExpressApplication>();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  if (!queryRunner) {
    throw new Error("Query runner failed to initialize for tests.");
  }
  return { app, queryRunner };
}
