import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260914033241 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "home_section" drop constraint if exists "home_section_type_unique";`);
    this.addSql(`create table if not exists "home_section" ("id" text not null, "type" text check ("type" in ('hero', 'drop_destaque', 'wab_teaser', 'dicas_destaque', 'apresentacao')) not null, "position" integer not null default 0, "visible" boolean not null default true, "config" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "home_section_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_home_section_type_unique" ON "home_section" ("type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_home_section_deleted_at" ON "home_section" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "home_section" cascade;`);
  }

}
