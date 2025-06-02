/* eslint-disable check-file/filename-naming-convention */
import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { UserEntity } from "./grassroots-shared/User.entity";
import { ContactEntityOutDTO } from "./grassroots-shared/Contact.entity.dto";

import * as dotenv from "dotenv";
dotenv.config({
  path: "../.env.development",
});

export default defineConfig({
  metadataCache: { enabled: false },
  driver: PostgreSqlDriver,
  entities: [ContactEntityOutDTO, UserEntity],
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  dbName: process.env.POSTGRES_DATABASE,
});
