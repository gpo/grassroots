import { Migration } from '@mikro-orm/migrations';

export class Migration20250929172955 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" alter column "middle_name" type varchar(255) using ("middle_name"::varchar(255));`);
    this.addSql(`alter table "contact_entity" alter column "middle_name" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" alter column "middle_name" type varchar(255) using ("middle_name"::varchar(255));`);
    this.addSql(`alter table "contact_entity" alter column "middle_name" set not null;`);
  }

}
