import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260914032319 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "drop_week" ("id" text not null, "title" text null, "status" text check ("status" in ('draft', 'published')) not null default 'draft', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "drop_week_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_drop_week_deleted_at" ON "drop_week" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "drop_week_item" ("id" text not null, "drop_week_id" text not null, "product_id" text not null, "position" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "drop_week_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_drop_week_item_drop_week_id" ON "drop_week_item" ("drop_week_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_drop_week_item_deleted_at" ON "drop_week_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "drop_week_item" add constraint "drop_week_item_drop_week_id_foreign" foreign key ("drop_week_id") references "drop_week" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "drop_week_item" drop constraint if exists "drop_week_item_drop_week_id_foreign";`);

    this.addSql(`drop table if exists "drop_week" cascade;`);

    this.addSql(`drop table if exists "drop_week_item" cascade;`);
  }

}
