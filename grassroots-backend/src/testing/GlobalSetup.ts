import mikroORMConfig from "../mikro-orm.config";
import { MikroORM } from "@mikro-orm/core";

import dotenvFlow from "dotenv-flow";
import { getEnvFilePaths } from "../GetEnvFilePaths";

dotenvFlow.config({
  // Reversed so that earlier files take priority, to align with the ConfigModule.
  files: getEnvFilePaths().reverse(),
});

export default async function setup(): Promise<void> {
  const orm = await MikroORM.init(mikroORMConfig);
  const generator = orm.getSchemaGenerator();
  await generator.dropSchema();
  await generator.createSchema();
  // Tests create their own orm handle.
  await orm.close();
}
