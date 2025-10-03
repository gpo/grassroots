import { Migration } from '@mikro-orm/migrations';

export class Migration20250929234320 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" alter column "gvote_id" type varchar(255) using ("gvote_id"::varchar(255));`);
    this.addSql(`alter table "contact_entity" alter column "gvote_id" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" alter column "gvote_id" type varchar(255) using ("gvote_id"::varchar(255));`);
    this.addSql(`alter table "contact_entity" alter column "gvote_id" set not null;`);
  }

}
