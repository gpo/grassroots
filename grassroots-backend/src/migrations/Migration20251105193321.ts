import { Migration } from '@mikro-orm/migrations';

export class Migration20251105193321 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop table if exists "user_sessions" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "user_sessions" ("sid" varchar not null, "sess" json not null, "expire" timestamp(6) not null, constraint "session_pkey" primary key ("sid"));`);
    this.addSql(`create index "IDX_session_expire" on "user_sessions" ("expire");`);
  }

}
