import { Migration } from '@mikro-orm/migrations';

export class Migration20251005004202 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "phone_canvass_contact_entity" ("id" serial primary key, "phone_canvas_id" uuid not null, "metadata" jsonb not null, "call_status" varchar(255) not null, "contact_id" int not null);`);

    this.addSql(`alter table "phone_canvass_contact_entity" add constraint "phone_canvass_contact_entity_phone_canvas_id_foreign" foreign key ("phone_canvas_id") references "phone_canvass_entity" ("id") on update cascade;`);
    this.addSql(`alter table "phone_canvass_contact_entity" add constraint "phone_canvass_contact_entity_contact_id_foreign" foreign key ("contact_id") references "contact_entity" ("id") on update cascade;`);

    this.addSql(`drop table if exists "phone_canvass_to_contact_entity" cascade;`);

    this.addSql(`drop table if exists "user_sessions" cascade;`);

    this.addSql(`alter table "contact_entity" drop constraint "contact_entity_email_unique";`);
    this.addSql(`alter table "contact_entity" drop constraint "contact_entity_gvote_id_unique";`);

    this.addSql(`alter table "user_entity" alter column "emails" type jsonb using ("emails"::jsonb);`);
    this.addSql(`alter table "user_entity" alter column "emails" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "phone_canvass_to_contact_entity" ("id" serial primary key, "phone_canvas_id" uuid not null, "metadata" jsonb not null, "call_status" varchar(255) not null, "contact_id" int4 not null);`);

    this.addSql(`create table "user_sessions" ("sid" varchar not null, "sess" json not null, "expire" timestamp(6) not null, constraint "session_pkey" primary key ("sid"));`);
    this.addSql(`create index "IDX_session_expire" on "user_sessions" ("expire");`);

    this.addSql(`drop table if exists "phone_canvass_contact_entity" cascade;`);

    this.addSql(`alter table "contact_entity" add constraint "contact_entity_email_unique" unique ("email");`);
    this.addSql(`alter table "contact_entity" add constraint "contact_entity_gvote_id_unique" unique ("gvote_id");`);

    this.addSql(`alter table "user_entity" alter column "emails" type jsonb using ("emails"::jsonb);`);
    this.addSql(`alter table "user_entity" alter column "emails" drop not null;`);
  }

}
