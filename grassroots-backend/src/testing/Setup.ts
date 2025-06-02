import { NestExpressApplication } from "@nestjs/platform-express";
import { getTestApp, TestSpecificDependencies } from "./GetTestApp";
import { EntityManager, MikroORM } from "@mikro-orm/core";

export class TestFixture {
  app: NestExpressApplication;

  constructor(props: { app: NestExpressApplication }) {
    this.app = props.app;
  }
}

// Inspired by https://mattburke.dev/using-test-hooks-for-shared-fixtures/
export function useTestFixture(
  dependencies: TestSpecificDependencies,
): () => TestFixture {
  let fixture: TestFixture | undefined;

  beforeAll(async () => {
    const { app } = await getTestApp(dependencies);
    const orm = app.get<MikroORM>(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();
    fixture = new TestFixture({ app });
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
