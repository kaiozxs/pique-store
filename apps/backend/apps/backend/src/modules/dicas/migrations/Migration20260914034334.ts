import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260914034334 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "tip_post" drop constraint if exists "tip_post_slug_unique";`);
    this.addSql(`create table if not exists "tip_post" ("id" text not null, "title" text not null, "slug" text not null, "excerpt" text null, "body" text not null, "cover_image" text null, "status" text check ("status" in ('draft', 'published')) not null default 'draft', "published_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tip_post_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tip_post_slug_unique" ON "tip_post" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tip_post_deleted_at" ON "tip_post" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "tip_post" cascade;`);
  }

}
