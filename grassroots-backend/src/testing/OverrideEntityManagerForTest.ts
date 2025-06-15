import { EntityManager, MikroORM } from "@mikro-orm/core";
import { TestingModuleBuilder } from "@nestjs/testing";

export function overrideEntityManagerForTest(
  builder: TestingModuleBuilder,
): TestingModuleBuilder {
  return builder.overrideProvider(EntityManager).useFactory({
    factory: (orm: MikroORM): EntityManager => {
      const fork = orm.em.fork();
      return fork;
    },
    inject: [MikroORM],
  });
}
