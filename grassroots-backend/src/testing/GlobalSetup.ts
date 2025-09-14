import mikroORMConfig from "../../../grassroots-backend/src/mikro-orm.config.js";
import { MikroORM } from "@mikro-orm/core";

export default async function setup(): Promise<void> {
  const orm = await MikroORM.init(mikroORMConfig);
  const generator = orm.getSchemaGenerator();
  await generator.dropSchema();
  await generator.createSchema();
  // Tests create their own orm handle.
  await orm.close();
}
