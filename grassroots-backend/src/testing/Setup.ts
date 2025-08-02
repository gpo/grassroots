import { NestExpressApplication } from "@nestjs/platform-express";
import { getTestApp, TestSpecificDependencies } from "./GetTestApp";
import { EntityManager, MikroORM, RequestContext } from "@mikro-orm/core";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

export interface TestFixtureProps {
  app: NestExpressApplication;
}

export class TestFixture {
  app: NestExpressApplication;
  // Used for an outer transaction across all tests.
  outerEntityManager: EntityManager;
  // Initialized in beforeEach.
  entityManager!: EntityManager;
  orm: MikroORM;

  constructor(props: TestFixtureProps) {
    this.app = props.app;
    this.orm = this.app.get<MikroORM>(MikroORM);
    this.outerEntityManager = this.orm.em.fork();
  }
}

// Inspired by https://mattburke.dev/using-test-hooks-for-shared-fixtures/
export function useTestFixture(
  dependencies: TestSpecificDependencies,
): () => TestFixture {
  // Assigned in beforeEach.
  let fixture!: TestFixture;

  beforeAll(async () => {
    const { app } = await getTestApp(dependencies);
    fixture = new TestFixture({
      app,
    });
    // TODO: eliminate duplication with E2ESetup.
    await fixture.outerEntityManager.begin();
  });

  afterAll(async () => {
    await fixture.outerEntityManager.rollback();
    fixture.outerEntityManager.clear();
    await fixture.orm.close();
    await fixture.app.close();
  });

  beforeEach(async () => {
    fixture.entityManager = fixture.orm.em.fork();
    //await fixture.entityManager.begin();

    await RequestContext.create(fixture.entityManager, async () => {
      await fixture.entityManager.begin();
    });
  });

  afterEach(async () => {
    await fixture.entityManager.rollback();
    fixture.entityManager.clear();
  });

  return () => {
    return fixture;
  };
}
