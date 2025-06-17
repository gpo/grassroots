import { Migration } from '@mikro-orm/migrations';

export class Migration20250615195058 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "user_entity" drop constraint "user_entity_pkey";`);

    this.addSql(`alter table "user_entity" rename column "email" to "id";`);
    this.addSql(`alter table "user_entity" add constraint "user_entity_pkey" primary key ("id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user_entity" drop constraint "user_entity_pkey";`);

    this.addSql(`alter table "user_entity" rename column "id" to "email";`);
    this.addSql(`alter table "user_entity" add constraint "user_entity_pkey" primary key ("email");`);
  }

}
