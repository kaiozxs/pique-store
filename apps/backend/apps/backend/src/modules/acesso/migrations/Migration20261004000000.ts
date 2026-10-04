import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261004000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "acesso_painel" ("id" text not null, "customer_id" text not null, "papel" text check ("papel" in ('dono', 'lojista')) not null, "concedido_por" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "acesso_painel_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_acesso_painel_customer_id_unique" ON "acesso_painel" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_acesso_painel_deleted_at" ON "acesso_painel" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "acesso_painel" cascade;`);
  }

}
