import { Migration } from '@mikro-orm/migrations';

export class Migration20250630165310 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "organization_entity" ("id" serial primary key, "name" varchar(255) not null, "parent_id" int null);`);

    this.addSql(`alter table "organization_entity" add constraint "organization_entity_parent_id_foreign" foreign key ("parent_id") references "organization_entity" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "organization_entity" drop constraint "organization_entity_parent_id_foreign";`);

    this.addSql(`drop table if exists "organization_entity" cascade;`);
  }

}
