import { Client } from "openapi-fetch";
import { listenAndConfigureApp } from "../app/App.module.js";
import { paths } from "grassroots-shared/OpenAPI.gen";
import { getTestApp, TestSpecificDependencies } from "./GetTestApp.js";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { TestFixture, TestFixtureProps } from "./Setup.js";
import { EntityManager } from "@mikro-orm/postgresql";

type GrassRootsAPIRaw = (
  path: keyof paths,
  options?: RequestInit,
) => Promise<Response>;

type E2ETestFixtureProps = TestFixtureProps & {
  grassrootsAPI: Client<paths>;
  grassrootsAPIRaw: GrassRootsAPIRaw;
};

export class E2ETestFixture extends TestFixture {
  grassrootsAPI: Client<paths>;
  // grassrootsAPI parses the response as JSON. This uses the strongly typed paths from grassrootsAPI,
  // but just provides a thin wrapper over normal fetch.
  grassrootsAPIRaw: GrassRootsAPIRaw;

  constructor(props: E2ETestFixtureProps) {
    super(props);
    this.grassrootsAPI = props.grassrootsAPI;
    this.grassrootsAPIRaw = props.grassrootsAPIRaw;
    this.entityManager = this.app.get<EntityManager>(EntityManager);
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
    const baseUrl = `http://localhost:${String(port)}`;
    const grassrootsAPI = createClient<paths>({
      baseUrl,
    });
    const grassrootsAPIRaw: GrassRootsAPIRaw = (path, options) => {
      return fetch(baseUrl + path, options);
    };
    fixture = new E2ETestFixture({ app, grassrootsAPI, grassrootsAPIRaw });
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
