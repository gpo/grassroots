import createClient, { Client } from "openapi-fetch";
import { listenAndConfigureApp } from "../App.module";
import { paths } from "../grassroots-shared/OpenAPI.gen";
import { getTestApp, TestSpecificDependencies } from "./GetTestApp";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { EntityManagerProvider } from "../orm/EntityManager.provider";
import { TestFixture, TestFixtureProps } from "./Setup";

type E2ETestFixtureProps = TestFixtureProps & {
  grassrootsAPI: Client<paths>;
};

class E2ETestFixture extends TestFixture {
  grassrootsAPI: Client<paths>;

  constructor(props: E2ETestFixtureProps) {
    super(props);
    this.grassrootsAPI = props.grassrootsAPI;
    this.entityManager = this.app.get<EntityManagerProvider>(
      EntityManagerProvider,
    ).entityManager;
  }
}

// Inspired by https://mattburke.dev/using-test-hooks-for-shared-fixtures/
export function useE2ETestFixture(
  dependencies: TestSpecificDependencies,
): () => E2ETestFixture {
  let fixture: E2ETestFixture | undefined;

  beforeAll(async () => {
    const { app } = await getTestApp(dependencies);
    const { port } = await listenAndConfigureApp(app, 0);
    const grassrootsAPI = createClient<paths>({
      baseUrl: `http://localhost:${String(port)}`,
      credentials: "include",
    });
    fixture = new E2ETestFixture({ app, grassrootsAPI });
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
  });

  return () => {
    if (fixture === undefined) {
      throw new Error("Failed to initialize fixture");
    }
    return fixture;
  };
}
