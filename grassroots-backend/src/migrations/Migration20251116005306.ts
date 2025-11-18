import { Migration } from '@mikro-orm/migrations';

export class Migration20251116005306 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" add column "voted" varchar(255) null, add column "membership_status" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop column "voted", drop column "membership_status";`);
  }

}
