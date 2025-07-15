/* eslint-disable check-file/filename-naming-convention */
import { defineConfig, PostgreSqlDriver, Options } from "@mikro-orm/postgresql";
import { UserEntity } from "./users/User.entity";
import { ContactEntity } from "./contacts/entities/Contact.entity";
import { OrganizationEntity } from "./organizations/Organization.entity";
import { getEnvironmentVariables } from "./GetEnvironmentVariables";

/**
 * Creates the MikroORM configuration with async environment loading
 */
async function createMikroOrmConfig(): Promise<Options> {
  const environmentConfig = await getEnvironmentVariables();

  return defineConfig({
    metadataCache: { enabled: false },
    driver: PostgreSqlDriver,
    entities: [ContactEntity, UserEntity, OrganizationEntity],
    host: environmentConfig.POSTGRES_HOST,
    port: Number(environmentConfig.POSTGRES_PORT),
    user: environmentConfig.POSTGRES_USER,
    password: environmentConfig.POSTGRES_PASSWORD,
    dbName: environmentConfig.POSTGRES_DATABASE,
    debug: true,
  });
}

// Export the Promise - consumers will need to await it
export default createMikroOrmConfig();
