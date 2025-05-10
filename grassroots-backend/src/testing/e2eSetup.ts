import { NestExpressApplication } from "@nestjs/platform-express";
import createClient, { Client } from "openapi-fetch";
import { listenAndConfigureApp } from "../app.module";
import { paths } from "../grassroots-shared/openAPI.gen";
import { QueryRunner } from "typeorm";
import { getTestApp, TestSpecificDependencies } from "./getTestApp";

export async function e2eBeforeAll(
  dependencies: TestSpecificDependencies,
): Promise<{
  app: NestExpressApplication;
  grassrootsAPI: Client<paths>;
  queryRunner: QueryRunner;
}> {
  const { app, queryRunner } = await getTestApp(dependencies);
  const { port } = await listenAndConfigureApp(app, 0);
  const grassrootsAPI = createClient<paths>({
    baseUrl: `http://localhost:${String(port)}`,
  });
  return { app, grassrootsAPI, queryRunner };
}
