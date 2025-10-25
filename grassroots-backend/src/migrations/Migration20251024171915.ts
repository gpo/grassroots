import { Migration } from '@mikro-orm/migrations';

export class Migration20251024171915 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" alter column "played_voicemail" type boolean using ("played_voicemail"::boolean);`);
    this.addSql(`alter table "phone_canvass_contact_entity" alter column "played_voicemail" set default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" alter column "played_voicemail" drop default;`);
    this.addSql(`alter table "phone_canvass_contact_entity" alter column "played_voicemail" type boolean using ("played_voicemail"::boolean);`);
  }

}
