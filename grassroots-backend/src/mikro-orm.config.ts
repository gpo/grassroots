/* eslint-disable check-file/filename-naming-convention */
import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { UserEntity } from "./users/User.entity.js";
import { ContactEntity } from "./contacts/entities/Contact.entity.js";

import { OrganizationEntity } from "./organizations/Organization.entity.js";
import { PhoneCanvassEntity } from "./phone-canvass/entities/PhoneCanvass.entity.js";
import { getEnvironmentVariables } from "./GetEnvironmentVariables.js";

export async function createMikroOrmConfig(): Promise<ReturnType<typeof defineConfig>> {
  const environmentConfig = await getEnvironmentVariables();

  return defineConfig({
    metadataCache: { enabled: false },
    driver: PostgreSqlDriver,
    entities: [ContactEntity, UserEntity, OrganizationEntity, PhoneCanvassEntity],
    host: environmentConfig.POSTGRES_HOST,
    port: Number(environmentConfig.POSTGRES_PORT),
    user: environmentConfig.POSTGRES_USER,
    password: String(environmentConfig.POSTGRES_PASSWORD),
    dbName: environmentConfig.POSTGRES_DATABASE,
    debug: true,
  });
}
