import defineConfig from "../mikro-orm.config";
import { MikroORM } from "@mikro-orm/core";

export default async function setup(): Promise<void> {
  const orm = await MikroORM.init(defineConfig);
  const generator = orm.getSchemaGenerator();
  await generator.dropSchema();
  await generator.createSchema();
  // Tests create their own orm handle.
  await orm.close();
}
