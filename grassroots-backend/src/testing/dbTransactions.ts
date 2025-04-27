import { DataSource, QueryRunner } from "typeorm";
import { getTestApp } from "./getTestApp";

let queryRunner: ReturnType<DataSource["createQueryRunner"]>;

export async function startTestTransaction(): Promise<QueryRunner> {
  const dataSource = (await getTestApp()).get(DataSource);
  queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  return queryRunner;
}

export async function rollbackTestTransaction() {
  if (!queryRunner) {
    throw new Error("Can't rollback transaction that was never started.");
  }
  await queryRunner.rollbackTransaction();
  await queryRunner.release();
}
