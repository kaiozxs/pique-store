import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260914030719 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ownership_transfer" drop constraint if exists "ownership_transfer_status_check";`);

    this.addSql(`alter table if exists "ownership_transfer" add constraint "ownership_transfer_status_check" check("status" in ('pendente', 'rejeitada', 'concluida'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "ownership_transfer" drop constraint if exists "ownership_transfer_status_check";`);

    this.addSql(`alter table if exists "ownership_transfer" add constraint "ownership_transfer_status_check" check("status" in ('pendente', 'autorizada', 'rejeitada', 'concluida'));`);
  }

}
