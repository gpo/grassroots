import { Migration } from '@mikro-orm/migrations';

export class Migration20250724171027 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user_role_entity" ("id" serial primary key, "user_id" varchar(255) not null, "_role_id" int not null, "organization_id" int not null, "inherited" boolean not null);`);

    this.addSql(`alter table "user_role_entity" add constraint "user_role_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;`);
    this.addSql(`alter table "user_role_entity" add constraint "user_role_entity_organization_id_foreign" foreign key ("organization_id") references "organization_entity" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_role_entity" cascade;`);
  }

}
