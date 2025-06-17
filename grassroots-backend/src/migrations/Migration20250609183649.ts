import { Migration } from '@mikro-orm/migrations';

export class Migration20250609183649 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user_entity" alter column "first_name" type varchar(255) using ("first_name"::varchar(255));`);
    this.addSql(`alter table "user_entity" alter column "first_name" drop not null;`);
    this.addSql(`alter table "user_entity" alter column "last_name" type varchar(255) using ("last_name"::varchar(255));`);
    this.addSql(`alter table "user_entity" alter column "last_name" drop not null;`);
    this.addSql(`alter table "user_entity" alter column "display_name" type varchar(255) using ("display_name"::varchar(255));`);
    this.addSql(`alter table "user_entity" alter column "display_name" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user_entity" alter column "first_name" type varchar(255) using ("first_name"::varchar(255));`);
    this.addSql(`alter table "user_entity" alter column "first_name" set not null;`);
    this.addSql(`alter table "user_entity" alter column "last_name" type varchar(255) using ("last_name"::varchar(255));`);
    this.addSql(`alter table "user_entity" alter column "last_name" set not null;`);
    this.addSql(`alter table "user_entity" alter column "display_name" type varchar(255) using ("display_name"::varchar(255));`);
    this.addSql(`alter table "user_entity" alter column "display_name" set not null;`);
  }

}
