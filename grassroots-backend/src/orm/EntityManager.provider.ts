import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";

@Injectable()
// For tests, we need to fork the global entity manager, and use it across all services.
// This provider lets us inject the forked entity manager where it's needed.
export class EntityManagerProvider {
  constructor(public readonly entityManager: EntityManager) {}
}
