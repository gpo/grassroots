import { Migration } from '@mikro-orm/migrations';

export class Migration20250617223657 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user_entity" add column "emails" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user_entity" drop column "emails";`);
  }

}
