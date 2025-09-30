import { Migration } from '@mikro-orm/migrations';

export class Migration20250929140734 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" add column "gvote_id" varchar(255) not null;`);
    this.addSql(`alter table "contact_entity" add constraint "contact_entity_gvote_id_unique" unique ("gvote_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop constraint "contact_entity_gvote_id_unique";`);
    this.addSql(`alter table "contact_entity" drop column "gvote_id";`);
  }

}
