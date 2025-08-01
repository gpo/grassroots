import { Migration } from '@mikro-orm/migrations';

export class Migration20250727163356 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" add column "organization_id" int not null;`);
    this.addSql(`alter table "contact_entity" add constraint "contact_entity_organization_id_foreign" foreign key ("organization_id") references "organization_entity" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop constraint "contact_entity_organization_id_foreign";`);

    this.addSql(`alter table "contact_entity" drop column "organization_id";`);
  }

}
