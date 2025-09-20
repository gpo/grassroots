import { Migration } from '@mikro-orm/migrations';

export class Migration20250918203354 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "phone_canvass_entity" ("id" uuid not null default gen_random_uuid(), constraint "phone_canvass_entity_pkey" primary key ("id"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "phone_canvass_entity" cascade;`);
  }

}
