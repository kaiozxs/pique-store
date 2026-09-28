"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { MedusaCustomer } from "@/lib/customer";
import type { ShippingAddressInput } from "@/lib/checkout";
import {
  addAddressAction,
  removeAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
} from "../actions";

const VAZIO: ShippingAddressInput = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "br",
  phone: "",
};

const inputClass =
  "border border-white/20 bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";

type Endereco = NonNullable<MedusaCustomer["addresses"]>[number];

export function EnderecosClient({ customer }: { customer: MedusaCustomer }) {
  const router = useRouter();
  const enderecos = customer.addresses ?? [];

  const [form, setForm] = useState<ShippingAddressInput | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [confirmandoRemover, setConfirmandoRemover] = useState<string | null>(null);
  const [herdeiro, setHerdeiro] = useState("");
  const [cepCarregando, setCepCarregando] = useState(false);
  const [isPending, startTransition] = useTransition();

  function abrirNovo() {
    setEditandoId(null);
    setForm(VAZIO);
  }

  function abrirEdicao(e: Endereco) {
    setEditandoId(e.id);
    setForm({
      first_name: e.first_name ?? "",
      last_name: e.last_name ?? "",
      address_1: e.address_1 ?? "",
      address_2: e.address_2 ?? "",
      city: e.city ?? "",
      province: e.province ?? "",
      postal_code: e.postal_code ?? "",
      country_code: e.country_code ?? "br",
      phone: e.phone ?? "",
    });
  }

  // Mesmo autofill de CEP do checkout, pra não digitar rua e cidade à mão.
  function mudarCep(valor: string) {
    setForm((f) => (f ? { ...f, postal_code: valor } : f));
    const digitos = valor.replace(/\D/g, "");
    if (digitos.length !== 8) return;

    setCepCarregando(true);
    fetch(`https://viacep.com.br/ws/${digitos}/json/`)
      .then((r) => r.json())
      .then((d) => {
        if (d.erro) return;
        setForm((f) =>
          f
            ? {
                ...f,
                address_1: d.logradouro || f.address_1,
                city: d.localidade || f.city,
                province: d.uf ? String(d.uf).toLowerCase() : f.province,
              }
            : f
        );
      })
      .catch(() => {})
      .finally(() => setCepCarregando(false));
  }

  function salvar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form) return;
    startTransition(async () => {
      if (editandoId) await updateAddressAction(editandoId, form);
      else await addAddressAction(form);
      setForm(null);
      setEditandoId(null);
      router.refresh();
    });
  }

  // Excluir o padrão sem escolher outro deixaria a conta sem endereço de
  // entrega preferido, e o checkout voltaria a abrir em branco sem a pessoa
  // entender por quê. Quando há outros endereços, o próximo assume.
  function remover(id: string, herdeiroId?: string) {
    startTransition(async () => {
      if (herdeiroId) await setDefaultAddressAction(herdeiroId);
      await removeAddressAction(id);
      setConfirmandoRemover(null);
      setHerdeiro("");
      router.refresh();
    });
  }

  function tornarPadrao(id: string) {
    startTransition(async () => {
      await setDefaultAddressAction(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {enderecos.length === 0 && !form && (
        <p className="text-sm text-paper/50">Nenhum endereço salvo ainda.</p>
      )}

      {enderecos.map((e) => (
        <div key={e.id} className="border border-white/12 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 text-sm leading-relaxed text-paper/80">
              <div className="mb-1 flex items-center gap-2.5">
                <span className="font-semibold text-paper">
                  {e.first_name} {e.last_name}
                </span>
                {e.is_default_shipping && (
                  <span className="border border-accent px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-accent">
                    PADRÃO
                  </span>
                )}
              </div>
              {e.address_1}
              {e.address_2 ? `, ${e.address_2}` : ""}
              <br />
              {e.city}
              {e.province ? ` - ${e.province.toUpperCase()}` : ""} {e.postal_code}
              {e.phone && (
                <>
                  <br />
                  {e.phone}
                </>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-4 text-[12px] font-semibold tracking-[0.06em]">
              {!e.is_default_shipping && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => tornarPadrao(e.id)}
                  className="text-paper/55 transition-colors hover:text-accent disabled:opacity-50"
                >
                  TORNAR PADRÃO
                </button>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => abrirEdicao(e)}
                className="text-paper/55 transition-colors hover:text-accent disabled:opacity-50"
              >
                EDITAR
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmandoRemover(e.id)}
                className="text-paper/55 transition-colors hover:text-accent disabled:opacity-50"
              >
                EXCLUIR
              </button>
            </div>
          </div>

          {/* Excluir endereço não volta atrás — pergunta antes, em vez de
              apagar no primeiro clique. */}
          {confirmandoRemover === e.id && (() => {
            const outros = enderecos.filter((o) => o.id !== e.id);
            const precisaEscolher = e.is_default_shipping && outros.length > 0;

            return (
              <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
                <span className="text-sm text-paper/70">
                  {precisaEscolher
                    ? "Esse é o seu endereço padrão. Escolha qual passa a ser antes de excluir:"
                    : "Excluir este endereço?"}
                </span>

                {precisaEscolher && (
                  <select
                    value={herdeiro}
                    onChange={(ev) => setHerdeiro(ev.target.value)}
                    className="w-fit max-w-full border border-white/20 bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-accent"
                  >
                    <option value="">Escolha um endereço</option>
                    {outros.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.address_1}
                        {o.city ? ` — ${o.city}` : ""}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    disabled={isPending || (precisaEscolher && !herdeiro)}
                    onClick={() => remover(e.id, precisaEscolher ? herdeiro : undefined)}
                    className="border border-accent bg-accent px-4 py-1.5 text-[12px] font-bold tracking-[0.08em] text-paper disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "EXCLUINDO..." : "SIM, EXCLUIR"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmandoRemover(null);
                      setHerdeiro("");
                    }}
                    className="text-[12px] font-semibold tracking-[0.06em] text-paper/55 hover:text-paper"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      ))}

      {form ? (
        <form onSubmit={salvar} className="flex flex-col gap-3 border border-white/12 p-5">
          <div className="mb-1 text-[12px] font-bold tracking-[0.14em] text-paper/60">
            {editandoId ? "EDITAR ENDEREÇO" : "NOVO ENDEREÇO"}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Nome"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className={inputClass}
            />
            <input
              required
              placeholder="Sobrenome"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
            <input
              required
              placeholder={cepCarregando ? "Buscando..." : "CEP"}
              value={form.postal_code}
              onChange={(e) => mudarCep(e.target.value)}
              className={inputClass}
            />
            <input
              required
              placeholder="Endereço"
              value={form.address_1}
              onChange={(e) => setForm({ ...form, address_1: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              placeholder="Complemento"
              value={form.address_2 ?? ""}
              onChange={(e) => setForm({ ...form, address_2: e.target.value })}
              className={inputClass}
            />
            <input
              required
              placeholder="Cidade"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Telefone"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4">
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
                setForm(null);
                setEditandoId(null);
              }}
              className="text-[12px] font-semibold tracking-[0.06em] text-paper/55 hover:text-paper"
            >
              CANCELAR
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={abrirNovo}
          className="w-fit border border-white/25 px-6 py-2.5 text-[12px] font-bold tracking-[0.1em] text-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/[0.06]"
        >
          + ADICIONAR ENDEREÇO
        </button>
      )}
    </div>
  );
}
