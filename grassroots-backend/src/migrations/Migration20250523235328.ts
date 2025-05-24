import { Migration } from '@mikro-orm/migrations';

export class Migration20250523235328 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "contact_entity_out_dto" ("id" serial primary key, "email" varchar(255) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "phone_number" varchar(255) not null);`);

    this.addSql(`create table "user_entity" ("email" varchar(255) not null, constraint "user_entity_pkey" primary key ("email"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "contact_entity_out_dto" cascade;`);

    this.addSql(`drop table if exists "user_entity" cascade;`);
  }

}
