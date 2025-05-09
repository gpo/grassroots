import {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository,
} from "typeorm";

export let queryRunnerForTest: QueryRunner | undefined = undefined;

// In test contexts, we need to use an explicit queryRunner, to allow running tests within transactions.
export function getRepo<Entity extends ObjectLiteral>(
  target: EntityTarget<Entity>,
  dataSource: DataSource,
): Repository<Entity> {
  if (queryRunnerForTest) {
    return queryRunnerForTest.manager.getRepository(target);
  }
  return dataSource.getRepository(target);
}
