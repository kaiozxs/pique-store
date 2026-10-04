import Link from "next/link";
import { fotoDoCliente, idPessoal, type MedusaCustomer } from "@/lib/customer";
import { ContaShell } from "@/components/conta/ContaShell";
import { DadosPessoais } from "./DadosPessoais";
import { PerfilIdentidade } from "./PerfilIdentidade";

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
 * próprias. O perfil mostra só o que é do perfil: identificação, foto, dados
 * e segurança.
 */
export function AccountDashboard({ customer }: { customer: MedusaCustomer }) {
  const nome = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email;

  return (
    <ContaShell
      titulo="Minha conta"
      descricao="Seus dados e a segurança do acesso."
    >
      <div className="flex flex-col gap-4">
        <PerfilIdentidade foto={fotoDoCliente(customer)} nome={nome} id={idPessoal(customer)} email={customer.email} />

        <Bloco titulo="DADOS PESSOAIS">
          <DadosPessoais customer={customer} />
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
