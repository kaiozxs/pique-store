import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Recuperar senha — PIQUE" };

const SUPPORT_EMAIL = "piquecompanysuporte@gmail.com";

/**
 * Recuperação de senha.
 *
 * O formulário automático ainda não existe porque depende do envio de e-mail,
 * que a loja não tem ligado. Em vez de mostrar um campo que não faria nada — a
 * pessoa digitaria o e-mail e ficaria esperando uma mensagem que nunca chega —
 * a página manda pro caminho que de fato resolve hoje, que é o atendimento.
 *
 * Quando o e-mail transacional entrar, é aqui que o formulário vem.
 */
export default function RecuperarSenhaPage() {
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto min-h-[60vh] max-w-lg px-6 py-20 sm:px-8">
        <div className="mb-2 text-[13px] font-semibold tracking-[0.28em] text-paper/50">CONTA</div>
        <h1 className="mb-6 font-display text-3xl tracking-wide sm:text-4xl">RECUPERAR SENHA</h1>

        <p className="mb-8 text-[15px] leading-relaxed text-paper/70">
          A redefinição automática por e-mail ainda não está no ar. Por enquanto, quem devolve o acesso
          à sua conta é o nosso atendimento — e é rápido.
        </p>

        <div className="border border-white/15 p-6">
          <div className="mb-3 text-[12px] font-bold tracking-[0.14em] text-accent">COMO FAZER</div>
          <p className="mb-4 text-sm leading-relaxed text-paper/70">
            Escreve pra gente com o e-mail cadastrado na conta, e o nome que você usou no cadastro:
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Recuperar%20senha`}
            className="text-sm font-semibold text-paper underline underline-offset-4 transition-colors hover:text-accent"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-paper/50">
          Se você entrou na PIQUE usando o Google, não existe senha pra recuperar: é só clicar em
          &ldquo;Continuar com o Google&rdquo; na tela de entrar.
        </p>

        <Link
          href="/conta"
          className="btn-preenche mt-10 inline-block border border-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em]"
        >
          VOLTAR PRA ENTRAR
        </Link>
      </div>
    </div>
  );
}
