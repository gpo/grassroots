import { Migration } from '@mikro-orm/migrations';

export class Migration20250804173939 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop constraint "contact_entity_organization_id_foreign";`);

    this.addSql(`alter table "contact_entity" rename column "organization_id" to "organizationId";`);
    this.addSql(`alter table "contact_entity" add constraint "contact_entity_organizationId_foreign" foreign key ("organizationId") references "organization_entity" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop constraint "contact_entity_organizationId_foreign";`);

    this.addSql(`alter table "contact_entity" rename column "organizationId" to "organization_id";`);
    this.addSql(`alter table "contact_entity" add constraint "contact_entity_organization_id_foreign" foreign key ("organization_id") references "organization_entity" ("id") on update cascade;`);
  }

}
