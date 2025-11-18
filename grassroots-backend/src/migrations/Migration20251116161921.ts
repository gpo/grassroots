import { Migration } from '@mikro-orm/migrations';

export class Migration20251116161921 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" add column "town" varchar(255) null, add column "postal_code" varchar(255) null, add column "province" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop column "town", drop column "postal_code", drop column "province";`);
  }

}
