import Link from "next/link";
import type { MedusaCustomer, MedusaCustomerOrder } from "@/lib/customer";
import { formatMoney } from "@/lib/medusa";
import { statusDoPedido } from "@/lib/order-status";
import { ContaShell } from "@/components/conta/ContaShell";
import { DadosPessoais } from "./DadosPessoais";
import { logoutAction } from "./actions";

function Bloco({
  titulo,
  acao,
  children,
}: {
  titulo: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-white/12 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-bold tracking-[0.1em] text-paper/70">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

/**
 * Minha Conta virou o que o documento do programador define: informações
 * pessoais e segurança. Pedidos, endereços e favoritos ganharam páginas
 * próprias — aqui ficam só os três últimos pedidos como atalho, pra não
 * repetir a lista inteira em dois lugares.
 */
export function AccountDashboard({
  customer,
  orders,
}: {
  customer: MedusaCustomer;
  orders: MedusaCustomerOrder[];
}) {
  const ultimos = orders.slice(0, 3);

  return (
    <ContaShell
      titulo={`Olá, ${customer.first_name ?? customer.email}`}
      acao={
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm font-semibold tracking-[0.08em] text-paper/50 transition-colors hover:text-accent"
          >
            SAIR
          </button>
        </form>
      }
    >
      <div className="flex flex-col gap-4">
        <Bloco titulo="DADOS PESSOAIS">
          <DadosPessoais customer={customer} />
        </Bloco>

        <Bloco
          titulo="ÚLTIMOS PEDIDOS"
          acao={
            <Link
              href="/conta/pedidos"
              className="text-[12px] font-semibold tracking-[0.06em] text-paper/55 transition-colors hover:text-accent"
            >
              VER TODOS
            </Link>
          }
        >
          {ultimos.length === 0 ? (
            <p className="text-sm text-paper/50">Você ainda não fez nenhum pedido.</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/10">
              {ultimos.map((order) => {
                const status = statusDoPedido(order);
                return (
                  <Link
                    key={order.id}
                    href={`/conta/pedidos/${order.id}`}
                    className="group flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 text-sm transition-colors hover:text-accent"
                  >
                    <span>
                      #{order.display_id} — {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <span className={status.excecao ? "text-paper/45" : "text-paper/70"}>
                      {status.rotulo}
                    </span>
                    <span className="font-semibold">
                      {formatMoney(order.total, order.currency_code)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Bloco>

        <Bloco titulo="SEGURANÇA">
          <div className="flex flex-col gap-3 text-sm text-paper/70">
            <p>
              A senha é trocada pelo atendimento enquanto o envio automático de e-mail não está no
              ar.{" "}
              <Link href="/conta/senha" className="underline underline-offset-4 hover:text-accent">
                Ver como fazer
              </Link>
              .
            </p>
            {/* Verificação em duas etapas, sessões e preferências de comunicação
                dependem de e-mail/SMS, que a loja ainda não tem ligados. Melhor
                dizer isso do que mostrar um botão que não faz nada. */}
            <p className="text-paper/45">
              Verificação em duas etapas, dispositivos conectados e preferências de comunicação
              entram quando os envios por e-mail e SMS estiverem ligados.
            </p>
          </div>
        </Bloco>
      </div>
    </ContaShell>
  );
}
