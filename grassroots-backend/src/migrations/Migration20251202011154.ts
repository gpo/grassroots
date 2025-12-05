import { Migration } from '@mikro-orm/migrations';

export class Migration20251202011154 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" add column "notes" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "phone_canvass_contact_entity" drop column "notes";`);
  }

}
