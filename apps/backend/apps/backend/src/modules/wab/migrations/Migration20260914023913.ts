import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260914023913 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "wab_content" ("id" text not null, "status" text check ("status" in ('em_construcao', 'revelado', 'oculto')) not null default 'em_construcao', "title" text null, "body" text null, "media" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "wab_content_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_wab_content_deleted_at" ON "wab_content" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "wab_content" cascade;`);
  }

}
