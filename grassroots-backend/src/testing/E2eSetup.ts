import { NestExpressApplication } from "@nestjs/platform-express";
import createClient, { Client } from "openapi-fetch";
import { listenAndConfigureApp } from "../App.module";
import { paths } from "../grassroots-shared/OpenAPI.gen";
import { getTestApp, TestSpecificDependencies } from "./GetTestApp";
import { EntityManager, MikroORM } from "@mikro-orm/core";

class E2ETestFixture {
  app: NestExpressApplication;
  grassrootsAPI: Client<paths>;

  constructor(props: {
    app: NestExpressApplication;
    grassrootsAPI: Client<paths>;
  }) {
    this.app = props.app;
    this.grassrootsAPI = props.grassrootsAPI;
  }
}

// Inspired by https://mattburke.dev/using-test-hooks-for-shared-fixtures/
export function useE2ETestFixture(
  dependencies: TestSpecificDependencies,
): () => E2ETestFixture {
  let fixture: E2ETestFixture | undefined;

  beforeAll(async () => {
    const { app } = await getTestApp(dependencies);
    const orm = app.get<MikroORM>(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();
    const { port } = await listenAndConfigureApp(app, 0);
    const grassrootsAPI = createClient<paths>({
      baseUrl: `http://localhost:${String(port)}`,
      credentials: "include",
    });
    fixture = new E2ETestFixture({ app, grassrootsAPI });
  });

  afterAll(async () => {
    await fixture?.app.close();
  });

  beforeEach(async () => {
    await fixture?.app.get<EntityManager>(EntityManager).begin();
  });

  afterEach(async () => {
    await fixture?.app.get<EntityManager>(EntityManager).rollback();
  });

  return () => {
    if (fixture === undefined) {
      throw new Error("Failed to initialize fixture");
    }
    return fixture;
  };
}
