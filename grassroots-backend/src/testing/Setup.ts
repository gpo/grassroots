import { NestExpressApplication } from "@nestjs/platform-express";
import { getTestApp, TestSpecificDependencies } from "./GetTestApp";
import { MikroORM } from "@mikro-orm/core";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { EntityManager } from "@mikro-orm/postgresql";

export interface TestFixtureProps {
  app: NestExpressApplication;
}

export class TestFixture {
  app: NestExpressApplication;
  entityManager: EntityManager;
  orm: MikroORM;

  constructor(props: TestFixtureProps) {
    this.app = props.app;
    this.entityManager = this.app.get<EntityManager>(EntityManager);
    this.orm = this.app.get<MikroORM>(MikroORM);
  }
}

// Inspired by https://mattburke.dev/using-test-hooks-for-shared-fixtures/
export function useTestFixture(
  dependencies: TestSpecificDependencies,
): () => TestFixture {
  let fixture: TestFixture | undefined;

  beforeAll(async () => {
    const { app } = await getTestApp(dependencies);
    fixture = new TestFixture({
      app,
    });
  });

  afterAll(async () => {
    await fixture?.orm.close();
    await fixture?.app.close();
  });

  beforeEach(async () => {
    await fixture?.entityManager.begin();
  });

  afterEach(async () => {
    await fixture?.entityManager.rollback();
    fixture?.entityManager.clear();
  });

  return () => {
    if (fixture === undefined) {
      throw new Error("Failed to initialize fixture");
    }
    return fixture;
  };
}
