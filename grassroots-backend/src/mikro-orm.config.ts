/* eslint-disable check-file/filename-naming-convention */
import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { UserEntity } from "./users/User.entity.js";
import { ContactEntity } from "./contacts/entities/Contact.entity.js";

import dotenvFlow from "dotenv-flow";
import { getEnvFilePaths } from "./GetEnvFilePaths.js";
import { OrganizationEntity } from "./organizations/Organization.entity.js";
dotenvFlow.config({
  // Reversed so that earlier files take priority, to align with the ConfigModule.
  files: getEnvFilePaths().reverse(),
});

export default defineConfig({
  metadataCache: { enabled: false },
  driver: PostgreSqlDriver,
  entities: [ContactEntity, UserEntity, OrganizationEntity],
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  dbName: process.env.POSTGRES_DATABASE,
  debug: true,
});
