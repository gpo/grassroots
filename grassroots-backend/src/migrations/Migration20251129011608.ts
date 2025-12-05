import { Migration } from '@mikro-orm/migrations';

export class Migration20251129011608 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" drop constraint "phone_canvass_contact_entity_phone_canvas_id_foreign";`);

    this.addSql(`alter table "phone_canvass_contact_entity" rename column "phone_canvas_id" to "phone_canvass_id";`);
    this.addSql(`alter table "phone_canvass_contact_entity" add constraint "phone_canvass_contact_entity_phone_canvass_id_foreign" foreign key ("phone_canvass_id") references "phone_canvass_entity" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" drop constraint "phone_canvass_contact_entity_phone_canvass_id_foreign";`);

    this.addSql(`alter table "phone_canvass_contact_entity" rename column "phone_canvass_id" to "phone_canvas_id";`);
    this.addSql(`alter table "phone_canvass_contact_entity" add constraint "phone_canvass_contact_entity_phone_canvas_id_foreign" foreign key ("phone_canvas_id") references "phone_canvass_entity" ("id") on update cascade;`);
  }

}
