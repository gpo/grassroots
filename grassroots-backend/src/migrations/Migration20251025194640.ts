import { Migration } from '@mikro-orm/migrations';

export class Migration20251025194640 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" add column "call_result" varchar(255) null, add column "played_voicemail" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" drop column "call_result", drop column "played_voicemail";`);
  }

}
