/**
 * Contrato mínimo de acesso ao banco.
 *
 * A camada de dados só usa isto: uma função de template (`sql\`select …\``),
 * `begin` para transações e `unsafe` para consultas longas reaproveitadas. É o
 * mesmo formato da biblioteca `postgres`, que roda em produção (Supabase); os
 * testes usam um Postgres embutido (PGlite) por trás da mesma interface — assim
 * as regras de compra são testadas de verdade, com SQL real, sem servidor.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export interface Sql {
  <T extends Row = Row>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>;
  begin<T>(fn: (tx: Sql) => Promise<T>): Promise<T>;
  /**
   * Consulta com texto montado no código e valores em `$1, $2…`. Os valores
   * nunca entram no texto (seguem separados, como no template).
   */
  unsafe<T extends Row = Row>(texto: string, params?: unknown[]): Promise<T[]>;
}

/** Erro de regra de negócio, com mensagem pronta para mostrar à pessoa. */
export class ErroDeRegra extends Error {
  constructor(
    message: string,
    public codigo: string = "regra"
  ) {
    super(message);
    this.name = "ErroDeRegra";
  }
}
