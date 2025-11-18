import { Migration } from '@mikro-orm/migrations';

export class Migration20251115214614 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" add column "address" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop column "address";`);
  }

}
