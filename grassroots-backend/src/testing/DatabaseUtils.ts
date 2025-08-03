import { MikroORM } from "@mikro-orm/postgresql";
import mikroORMConfig from "../mikro-orm.config";
import { ContactEntity } from "../contacts/entities/Contact.entity";
import { UserEntity } from "../users/User.entity";
import { OrganizationEntity } from "../organizations/Organization.entity";

export async function nukeDatabase(): Promise<void> {
  const orm = await MikroORM.init(mikroORMConfig);
  const em = orm.em.fork();
  
  // Delete all data using ORM methods
  await em.nativeDelete(ContactEntity, {});
  await em.nativeDelete(UserEntity, {});
  await em.nativeDelete(OrganizationEntity, {});
  
  await orm.close();
}

export async function clearContacts(): Promise<void> {
  const orm = await MikroORM.init(mikroORMConfig);
  const em = orm.em.fork();
  
  // Delete only contacts using ORM method
  await em.nativeDelete(ContactEntity, {});
  
  await orm.close();
}
