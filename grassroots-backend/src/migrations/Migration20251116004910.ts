import { Migration } from '@mikro-orm/migrations';

export class Migration20251116004910 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" add column "support_level" int null, add column "party_support" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop column "support_level", drop column "party_support";`);
  }

}
