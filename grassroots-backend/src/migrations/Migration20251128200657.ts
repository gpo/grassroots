import { Migration } from '@mikro-orm/migrations';

export class Migration20251128200657 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" drop constraint "phone_canvass_contact_entity_pkey";`);
    this.addSql(`alter table "phone_canvass_contact_entity" drop column "call_status";`);

    this.addSql(`alter table "phone_canvass_contact_entity" add column "been_called" boolean not null;`);
    this.addSql(`alter table "phone_canvass_contact_entity" rename column "id" to "phone_canvass_contact_id";`);
    this.addSql(`alter table "phone_canvass_contact_entity" add constraint "phone_canvass_contact_entity_pkey" primary key ("phone_canvass_contact_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" drop constraint "phone_canvass_contact_entity_pkey";`);
    this.addSql(`alter table "phone_canvass_contact_entity" drop column "been_called";`);

    this.addSql(`alter table "phone_canvass_contact_entity" add column "call_status" varchar(255) not null;`);
    this.addSql(`alter table "phone_canvass_contact_entity" rename column "phone_canvass_contact_id" to "id";`);
    this.addSql(`alter table "phone_canvass_contact_entity" add constraint "phone_canvass_contact_entity_pkey" primary key ("id");`);
  }

}
