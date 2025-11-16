import { Migration } from '@mikro-orm/migrations';

export class Migration20251116005704 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" alter column "address" type varchar(255) using ("address"::varchar(255));`);
    this.addSql(`alter table "contact_entity" alter column "address" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" alter column "address" type varchar(255) using ("address"::varchar(255));`);
    this.addSql(`alter table "contact_entity" alter column "address" set not null;`);
  }

}
