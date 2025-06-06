import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Module } from "@nestjs/common";

@Injectable()
// For tests, we need to fork the global entity manager, and use it across all services.
// This provider lets us inject the forked entity manager where it's needed.
export class EntityManagerProviderForTest {
  entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
  }
}

@Module({
  providers: [EntityManagerProviderForTest],
  exports: [EntityManagerProviderForTest],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EntityManagerForTestModule {}
