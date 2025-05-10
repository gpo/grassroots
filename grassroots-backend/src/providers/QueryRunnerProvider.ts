import { Injectable } from "@nestjs/common";
import { QueryRunner } from "typeorm";

@Injectable()
export class QueryRunnerProvider {
  queryRunner: QueryRunner;

  constructor(queryRunner: QueryRunner) {
    this.queryRunner = queryRunner;
  }
}
