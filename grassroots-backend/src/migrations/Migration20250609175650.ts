import { Migration } from '@mikro-orm/migrations';

export class Migration20250609175650 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user_entity" add column "first_name" varchar(255) not null, add column "last_name" varchar(255) not null, add column "display_name" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user_entity" drop column "first_name", drop column "last_name", drop column "display_name";`);
  }

}
