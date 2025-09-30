import { Migration } from '@mikro-orm/migrations';

export class Migration20250929165819 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" add column "middle_name" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop column "middle_name";`);
  }

}
