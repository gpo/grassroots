import { Migration } from '@mikro-orm/migrations';

export class Migration20251004004434 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "phone_canvass_contact_entity" ("id" serial primary key, "phone_canvas_id" uuid not null, "metadata" jsonb not null, "call_status" varchar(255) not null, "contact_id" int not null);`);

    this.addSql(`alter table "phone_canvass_contact_entity" add constraint "phone_canvass_contact_entity_phone_canvas_id_foreign" foreign key ("phone_canvas_id") references "phone_canvass_entity" ("id") on update cascade;`);
    this.addSql(`alter table "phone_canvass_contact_entity" add constraint "phone_canvass_contact_entity_contact_id_foreign" foreign key ("contact_id") references "contact_entity" ("id") on update cascade;`);

    this.addSql(`drop table if exists "phone_canvass_to_contact_entity" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "phone_canvass_to_contact_entity" ("id" serial primary key, "phone_canvas_id" uuid not null, "metadata" jsonb not null, "call_status" varchar(255) not null, "contact_id" int not null);`);

    this.addSql(`alter table "phone_canvass_to_contact_entity" add constraint "phone_canvass_to_contact_entity_phone_canvas_id_foreign" foreign key ("phone_canvas_id") references "phone_canvass_entity" ("id") on update cascade;`);
    this.addSql(`alter table "phone_canvass_to_contact_entity" add constraint "phone_canvass_to_contact_entity_contact_id_foreign" foreign key ("contact_id") references "contact_entity" ("id") on update cascade;`);

    this.addSql(`drop table if exists "phone_canvass_contact_entity" cascade;`);
  }

}
