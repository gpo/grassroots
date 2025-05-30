/* eslint-disable check-file/filename-naming-convention */
import { defineConfig } from "@mikro-orm/postgresql";
import { UserEntity } from "./grassroots-shared/User.entity";
import { ContactEntityOutDTO } from "./grassroots-shared/Contact.entity.dto";

import * as dotenv from "dotenv";
dotenv.config({
  path: "../.env.development",
});

export default defineConfig({
  entities: [ContactEntityOutDTO, UserEntity],
  host: "localhost",
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  dbName: process.env.POSTGRES_DATABASE,
});
