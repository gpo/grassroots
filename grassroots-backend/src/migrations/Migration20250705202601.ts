import { Migration } from '@mikro-orm/migrations';

export class Migration20250705202601 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "contact_entity_out_dto" ("id" serial primary key, "email" varchar(255) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "phone_number" varchar(255) not null);`);
    this.addSql(`alter table "contact_entity_out_dto" add constraint "contact_entity_out_dto_email_unique" unique ("email");`);

    this.addSql(`drop table if exists "contact_entity" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "contact_entity" ("id" serial primary key, "email" varchar(255) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "phone_number" varchar(255) not null);`);
    this.addSql(`alter table "contact_entity" add constraint "contact_entity_email_unique" unique ("email");`);

    this.addSql(`drop table if exists "contact_entity_out_dto" cascade;`);
  }

}
