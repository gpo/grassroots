import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import createClient, { Client } from "openapi-fetch";
import { AppModule, listenAndConfigureApp } from "../app.module";
import { paths } from "../grassroots-shared/openAPI.gen";
import { DataSource, QueryRunner } from "typeorm";
import { setQueryRunnerForTest } from "../getRepo";

export async function e2eBeforeAll(): Promise<{
  app: NestExpressApplication;
  grassrootsAPI: Client<paths>;
  queryRunner: QueryRunner;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: NestExpressApplication = moduleFixture.createNestApplication();
  const { port } = await listenAndConfigureApp(app, 0);
  await app.init();
  const grassrootsAPI = createClient<paths>({
    baseUrl: `http://localhost:${String(port)}`,
  });
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();
  setQueryRunnerForTest(queryRunner);
  return { app, grassrootsAPI, queryRunner };
}
