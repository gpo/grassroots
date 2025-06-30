import { Migration } from '@mikro-orm/migrations';

export class Migration20250630182244 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "role_entity" ("id" serial primary key, "name" varchar(255) not null, "can_view_contacts" boolean not null, "can_manage_contacts" boolean not null, "can_manage_users" boolean not null);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "role_entity" cascade;`);
  }

}
