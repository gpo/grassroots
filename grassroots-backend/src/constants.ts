import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const POSTGRES_CONFIG: TypeOrmModuleOptions = {
  type: "postgres",
  host: "192.168.1.22",
  port: 5432,
  username: "supertokens_user",
  password: "somePassword",
  database: "grassroots",
  synchronize: true,
};
