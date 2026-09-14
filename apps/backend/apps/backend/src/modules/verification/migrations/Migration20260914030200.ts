import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260914030200 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "piece_unit" drop constraint if exists "piece_unit_unique_code_unique";`);
    this.addSql(`create table if not exists "piece_unit" ("id" text not null, "unique_code" text not null, "product_variant_id" text not null, "serial_number" text null, "status" text check ("status" in ('nao_registrado', 'registrado', 'revogado')) not null default 'nao_registrado', "current_owner_customer_id" text null, "order_id" text null, "invoice_reference" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "piece_unit_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_piece_unit_unique_code_unique" ON "piece_unit" ("unique_code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_piece_unit_deleted_at" ON "piece_unit" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "ownership_transfer" ("id" text not null, "piece_unit_id" text not null, "from_customer_id" text null, "to_customer_id" text not null, "status" text check ("status" in ('pendente', 'autorizada', 'rejeitada', 'concluida')) not null default 'pendente', "authorized_at" timestamptz null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ownership_transfer_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ownership_transfer_piece_unit_id" ON "ownership_transfer" ("piece_unit_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ownership_transfer_deleted_at" ON "ownership_transfer" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "ownership_transfer" add constraint "ownership_transfer_piece_unit_id_foreign" foreign key ("piece_unit_id") references "piece_unit" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "ownership_transfer" drop constraint if exists "ownership_transfer_piece_unit_id_foreign";`);

    this.addSql(`drop table if exists "piece_unit" cascade;`);

    this.addSql(`drop table if exists "ownership_transfer" cascade;`);
  }

}
