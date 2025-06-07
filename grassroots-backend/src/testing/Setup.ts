import { NestExpressApplication } from "@nestjs/platform-express";
import { getTestApp, TestSpecificDependencies } from "./GetTestApp";
import { EntityManager } from "@mikro-orm/core";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { EntityManagerProvider } from "../orm/EntityManager.provider";

export class TestFixture {
  app: NestExpressApplication;
  entityManager: EntityManager;

  constructor(props: { app: NestExpressApplication }) {
    this.app = props.app;
    this.entityManager = this.app.get<EntityManagerProvider>(
      EntityManagerProvider,
    ).entityManager;
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
