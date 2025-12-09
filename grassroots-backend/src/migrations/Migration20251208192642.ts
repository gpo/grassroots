import { Migration } from '@mikro-orm/migrations';

export class Migration20251208192642 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "phone_canvass_entity" add column "last_sync_update" timestamptz not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "phone_canvass_entity" drop column "last_sync_update";`);
  }

}
