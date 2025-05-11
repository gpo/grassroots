import { Injectable, InjectionToken, Provider } from "@nestjs/common";
import { EntityTarget, ObjectLiteral, QueryRunner, Repository } from "typeorm";

@Injectable()
export class QueryRunnerProvider {
  queryRunner: QueryRunner;

  constructor(queryRunner: QueryRunner) {
    this.queryRunner = queryRunner;
  }

  // This might be one level of abstraction too many, as often things will
  // depend on multiple repos, making this a bit clunky. I do think this pattern will be common though.
  static getProviderFor<T, Entity extends ObjectLiteral>(
    provider: InjectionToken<T>,
    repoTarget: EntityTarget<Entity>,
    factory: (repo: Repository<Entity>) => T,
  ): Provider {
    return {
      provide: provider,
      useFactory: (queryRunnerProvider: QueryRunnerProvider): T => {
        const repo =
          queryRunnerProvider.queryRunner.manager.getRepository(repoTarget);
        return factory(repo);
      },
      inject: [QueryRunnerProvider],
    };
  }
}
