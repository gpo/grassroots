import { Migration } from '@mikro-orm/migrations';

export class Migration20251115214340 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "phone_canvass_entity" add column "creator_email" varchar(255) not null, add column "name" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "phone_canvass_entity" drop column "creator_email", drop column "name";`);
  }

}
