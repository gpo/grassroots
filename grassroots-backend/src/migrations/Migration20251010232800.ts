import { Migration } from '@mikro-orm/migrations';

export class Migration20251010232800 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "contact_entity" add constraint "contact_entity_gvote_id_unique" unique ("gvote_id");`);
    this.addSql(`alter table "contact_entity" add constraint "contact_entity_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "contact_entity" drop constraint "contact_entity_gvote_id_unique";`);
    this.addSql(`alter table "contact_entity" drop constraint "contact_entity_email_unique";`);
  }

}
