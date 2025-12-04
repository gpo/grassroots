import { Migration } from '@mikro-orm/migrations';

export class Migration20251203202916 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" add constraint "phone_canvass_contact_entity_contact_id_unique" unique ("contact_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" drop constraint "phone_canvass_contact_entity_contact_id_unique";`);
  }

}
