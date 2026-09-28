"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { MedusaCustomer } from "@/lib/customer";
import { updateProfileAction } from "./actions";

const inputClass =
  "border border-white/20 bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";

/**
 * Dados pessoais, agora editáveis.
 *
 * O e-mail fica de fora: trocar o endereço de acesso é operação sensível e o
 * próprio documento pede confirmação pelo contato antigo antes — o que
 * depende do envio de e-mail, que a loja ainda não tem. Deixar o campo aberto
 * aqui seria trocar o login sem nenhuma verificação.
 */
export function DadosPessoais({ customer }: { customer: MedusaCustomer }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    first_name: customer.first_name ?? "",
    last_name: customer.last_name ?? "",
    phone: customer.phone ?? "",
  });

  function salvar(ev: React.FormEvent) {
    ev.preventDefault();
    setErro(null);
    startTransition(async () => {
      try {
        await updateProfileAction(form);
        setEditando(false);
        router.refresh();
      } catch {
        // O formulário continua preenchido: perder o que a pessoa digitou por
        // causa de um erro é o segundo aborrecimento em cima do primeiro.
        setErro("Não deu pra salvar agora. Tenta de novo em instantes.");
      }
    });
  }

  if (!editando) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="text-sm leading-relaxed text-paper/80">
          {customer.first_name || customer.last_name ? (
            <>
              {customer.first_name} {customer.last_name}
              <br />
            </>
          ) : null}
          {customer.email}
          {customer.phone && (
            <>
              <br />
              {customer.phone}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="text-[12px] font-semibold tracking-[0.06em] text-paper/55 transition-colors hover:text-accent"
        >
          EDITAR
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          placeholder="Nome"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Sobrenome"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          className={inputClass}
        />
      </div>
      <input
        placeholder="Telefone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className={inputClass}
      />
      <p className="text-xs text-paper/40">
        O e-mail de acesso ({customer.email}) só pode ser alterado pelo atendimento, por segurança.
      </p>

      {erro && <p className="text-sm font-semibold text-red-400">{erro}</p>}

      <div className="mt-1 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="btn-preenche border border-accent px-7 py-2.5 text-[12px] font-bold tracking-[0.1em] disabled:opacity-60"
        >
          {isPending ? "SALVANDO..." : "SALVAR"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditando(false);
            setErro(null);
          }}
          className="text-[12px] font-semibold tracking-[0.06em] text-paper/55 hover:text-paper"
        >
          CANCELAR
        </button>
      </div>
    </form>
  );
}
