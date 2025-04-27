import {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository,
} from "typeorm";

// In test contexts, we need to use an explicit queryRunner, to allow running tests within transactions.
export function getRepo<Entity extends ObjectLiteral>(
  target: EntityTarget<Entity>,
  queryRunner: QueryRunner | undefined,
  dataSource: DataSource,
): Repository<Entity> {
  if (queryRunner) {
    return queryRunner.manager.getRepository(target);
  }
  return dataSource.getRepository(target);
}
