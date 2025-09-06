import { Migration } from '@mikro-orm/migrations';

export class Migration20250905002953 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "organization_entity" add column "abbreviated_name" varchar(255) not null, add column "description" varchar(255) not null;`);
    this.addSql(`alter table "organization_entity" add constraint "organization_entity_name_unique" unique ("name");`);
    this.addSql(`alter table "organization_entity" add constraint "organization_entity_abbreviated_name_unique" unique ("abbreviated_name");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "organization_entity" drop constraint "organization_entity_name_unique";`);
    this.addSql(`alter table "organization_entity" drop constraint "organization_entity_abbreviated_name_unique";`);
    this.addSql(`alter table "organization_entity" drop column "abbreviated_name", drop column "description";`);
  }

}
