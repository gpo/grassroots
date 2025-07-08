import { Migration } from '@mikro-orm/migrations';

export class Migration20250708145447 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "contact_entity" ("id" serial primary key, "email" varchar(255) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "phone_number" varchar(255) not null);`);
    this.addSql(`alter table "contact_entity" add constraint "contact_entity_email_unique" unique ("email");`);

    this.addSql(`create table "organization_entity" ("id" serial primary key, "name" varchar(255) not null, "parent_id" int null);`);

    this.addSql(`create table "user_entity" ("id" varchar(255) not null, "emails" jsonb null, "first_name" varchar(255) null, "last_name" varchar(255) null, "display_name" varchar(255) null, constraint "user_entity_pkey" primary key ("id"));`);

    this.addSql(`alter table "organization_entity" add constraint "organization_entity_parent_id_foreign" foreign key ("parent_id") references "organization_entity" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "organization_entity" drop constraint "organization_entity_parent_id_foreign";`);

    this.addSql(`drop table if exists "contact_entity" cascade;`);

    this.addSql(`drop table if exists "organization_entity" cascade;`);

    this.addSql(`drop table if exists "user_entity" cascade;`);
  }

}
