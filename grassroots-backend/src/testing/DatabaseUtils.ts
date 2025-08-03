import { MikroORM } from "@mikro-orm/postgresql";
import { ContactEntity } from "../contacts/entities/Contact.entity";
import { UserEntity } from "../users/User.entity";
import { OrganizationEntity } from "../organizations/Organization.entity";

export async function nukeDatabase(): Promise<void> {
  const orm = await MikroORM.init({
    entities: [ContactEntity, UserEntity, OrganizationEntity],
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    dbName: process.env.POSTGRES_DATABASE,
    debug: false,
  });

  const em = orm.em.fork();
  
  // Delete all data from tables
  await em.getConnection().execute('TRUNCATE TABLE "contact_entity" CASCADE');
  await em.getConnection().execute('TRUNCATE TABLE "user_entity" CASCADE');
  await em.getConnection().execute('TRUNCATE TABLE "organization_entity" CASCADE');
  
  await orm.close();
}

export async function clearContacts(): Promise<void> {
  const orm = await MikroORM.init({
    entities: [ContactEntity, UserEntity, OrganizationEntity],
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    dbName: process.env.POSTGRES_DATABASE,
    debug: false,
  });

  const em = orm.em.fork();
  
  // Delete only contacts
  await em.getConnection().execute('TRUNCATE TABLE "contact_entity" CASCADE');
  
  await orm.close();
}