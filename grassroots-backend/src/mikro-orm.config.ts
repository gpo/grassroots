/* eslint-disable check-file/filename-naming-convention */
import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { UserEntity } from "./users/User.entity.js";
import { ContactEntity } from "./contacts/entities/Contact.entity.js";

import { OrganizationEntity } from "./organizations/Organization.entity.js";
import { PhoneCanvassEntity } from "./phone-canvass/entities/PhoneCanvass.entity.js";
import { getEnvVars } from "./GetEnvVars.js";

async function createMikroOrmConfig(): Promise<
  ReturnType<typeof defineConfig>
> {
  const envVars = await getEnvVars();

  return defineConfig({
    metadataCache: { enabled: false },
    driver: PostgreSqlDriver,
    entities: [
      ContactEntity,
      UserEntity,
      OrganizationEntity,
      PhoneCanvassEntity,
    ],
    host: envVars.POSTGRES_HOST,
    port: Number(envVars.POSTGRES_PORT),
    user: envVars.POSTGRES_USER,
    password: envVars.POSTGRES_PASSWORD,
    dbName: envVars.POSTGRES_DATABASE,
    debug: true,
  });
}

export default await createMikroOrmConfig();
