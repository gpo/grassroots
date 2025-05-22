import { NestExpressApplication } from "@nestjs/platform-express";
import createClient, { Client } from "openapi-fetch";
import { listenAndConfigureApp } from "../App.module";
import { paths } from "../grassroots-shared/OpenAPI.gen";
import { QueryRunner } from "typeorm";
import { getTestApp, TestSpecificDependencies } from "./GetTestApp";

class E2ETestFixture {
  app: NestExpressApplication;
  grassrootsAPI: Client<paths>;
  queryRunner: QueryRunner;

  constructor(props: {
    app: NestExpressApplication;
    grassrootsAPI: Client<paths>;
    queryRunner: QueryRunner;
  }) {
    this.app = props.app;
    this.grassrootsAPI = props.grassrootsAPI;
    this.queryRunner = props.queryRunner;
  }
}

// Inspired by https://mattburke.dev/using-test-hooks-for-shared-fixtures/
export function useE2ETestFixture(
  dependencies: TestSpecificDependencies,
): () => E2ETestFixture {
  let fixture: E2ETestFixture | undefined;

  beforeAll(async () => {
    const { app, queryRunner } = await getTestApp(dependencies);
    const { port } = await listenAndConfigureApp(app, 0);
    const grassrootsAPI = createClient<paths>({
      baseUrl: `http://localhost:${String(port)}`,
      credentials: "include",
      fetch: fetch,
    });
    fixture = new E2ETestFixture({ app, grassrootsAPI, queryRunner });
  });

  afterAll(async () => {
    await fixture?.app.close();
  });

  beforeEach(async () => {
    await fixture?.queryRunner.startTransaction();
  });

  afterEach(async () => {
    await fixture?.queryRunner.rollbackTransaction();
  });

  return () => {
    if (fixture === undefined) {
      throw new Error("Failed to initialize fixture");
    }
    return fixture;
  };
}
