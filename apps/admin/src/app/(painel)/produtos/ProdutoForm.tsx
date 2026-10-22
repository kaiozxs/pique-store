"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { ProductAdmin, ProductInput } from "@/lib/produtos";
import { apagarProdutoAction, enviarImagemAction, salvarProdutoAction } from "./actions";

type Categoria = { id: string; handle: string; name: string };

type VariacaoEstado = {
  id?: string;
  title: string;
  sku: string;
  options: Record<string, string>;
  price: string;
  stock: string;
  allow_backorder: boolean;
  active: boolean;
};

const CAMPO =
  "rounded-md border border-border bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent disabled:opacity-60";
const ROTULO = "text-xs font-semibold uppercase tracking-wide text-muted";

function numero(texto: string): number {
  return Number(texto.trim().replace(/\./g, "").replace(",", ".") || "NaN");
}

function paraTexto(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function variacaoVazia(opcoes: string[]): VariacaoEstado {
  return {
    title: "",
    sku: "",
    options: Object.fromEntries(opcoes.map((o) => [o, ""])),
    price: "",
    stock: "0",
    allow_backorder: false,
    active: true,
  };
}

export function ProdutoForm({ categorias, produto }: { categorias: Categoria[]; produto: ProductAdmin | null }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(produto?.title ?? "");
  const [descricao, setDescricao] = useState(produto?.description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(produto?.status ?? "draft");
  const [prevenda, setPrevenda] = useState(produto?.is_presale ?? false);
  const [mensagemPrevenda, setMensagemPrevenda] = useState(produto?.presale_message ?? "");
  const [dataEnvio, setDataEnvio] = useState(produto?.estimated_ship_date ?? "");
  const [categoriasEscolhidas, setCategoriasEscolhidas] = useState<string[]>(produto?.categories.map((c) => c.id) ?? []);
  const [imagens, setImagens] = useState<string[]>(produto?.images.map((i) => i.url) ?? []);
  const [linkImagem, setLinkImagem] = useState("");
  const [nomesDasOpcoes, setNomesDasOpcoes] = useState((produto?.option_order ?? ["Tamanho"]).join(", "));
  const [variacoes, setVariacoes] = useState<VariacaoEstado[]>(
    produto
      ? produto.variants.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku ?? "",
          options: v.options,
          price: paraTexto(v.price),
          stock: String(v.stock),
          allow_backorder: v.allow_backorder,
          active: v.active,
        }))
      : [variacaoVazia(["Tamanho"])]
  );
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [salvando, iniciarSalvar] = useTransition();
  const [enviando, setEnviando] = useState(false);
  const arquivoRef = useRef<HTMLInputElement>(null);

  const opcoes = nomesDasOpcoes
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  function atualizar(i: number, patch: Partial<VariacaoEstado>) {
    setVariacoes((v) => v.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  function mover(i: number, delta: -1 | 1) {
    setImagens((lista) => {
      const j = i + delta;
      if (j < 0 || j >= lista.length) return lista;
      const copia = [...lista];
      [copia[i], copia[j]] = [copia[j]!, copia[i]!];
      return copia;
    });
  }

  async function enviarArquivos(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return;
    setEnviando(true);
    setMensagem(null);
    for (const arquivo of Array.from(arquivos)) {
      const dados = new FormData();
      dados.set("arquivo", arquivo);
      const r = await enviarImagemAction(dados);
      if (r.ok) setImagens((lista) => [...lista, r.url]);
      else setMensagem({ tipo: "erro", texto: r.error });
    }
    setEnviando(false);
    if (arquivoRef.current) arquivoRef.current.value = "";
  }

  function salvar() {
    setMensagem(null);
    const variantes: ProductInput["variants"] = [];
    for (const v of variacoes) {
      const preco = numero(v.price);
      const estoque = Number(v.stock);
      const valores = opcoes.map((o) => v.options[o]?.trim() ?? "");
      const nome = v.title.trim() || valores.filter(Boolean).join(" / ");
      if (!nome) {
        setMensagem({ tipo: "erro", texto: "Cada variação precisa de um nome ou de valores nas opções (ex.: tamanho)." });
        return;
      }
      if (!Number.isFinite(preco) || preco < 0) {
        setMensagem({ tipo: "erro", texto: `Preço inválido em "${nome}". Use números, ex.: 349,90.` });
        return;
      }
      if (!Number.isInteger(estoque) || estoque < 0) {
        setMensagem({ tipo: "erro", texto: `Estoque inválido em "${nome}". Use um número inteiro, zero ou mais.` });
        return;
      }
      variantes.push({
        id: v.id,
        title: nome,
        sku: v.sku.trim() || null,
        options: Object.fromEntries(opcoes.map((o) => [o, v.options[o]?.trim() ?? ""]).filter(([, valor]) => valor)),
        price: preco,
        stock: estoque,
        allow_backorder: v.allow_backorder,
        active: v.active,
      });
    }

    iniciarSalvar(async () => {
      const r = await salvarProdutoAction({
        id: produto?.id,
        title: titulo,
        description: descricao.trim() || null,
        status,
        option_order: opcoes,
        is_presale: prevenda,
        presale_message: prevenda ? mensagemPrevenda.trim() || null : null,
        estimated_ship_date: prevenda ? dataEnvio || null : null,
        category_ids: categoriasEscolhidas,
        images: imagens,
        variants: variantes,
      });
      if (!r.ok) {
        setMensagem({ tipo: "erro", texto: r.error });
        return;
      }
      if (!produto) {
        router.push(`/produtos/${r.id}`);
      } else {
        setMensagem({ tipo: "ok", texto: status === "published" ? "Salvo — já está na loja." : "Salvo como rascunho." });
        router.refresh();
      }
    });
  }

  function apagar() {
    if (!produto) return;
    const aviso = `Apagar "${produto.title}"? Se já foi vendido, ele só sai da loja (vira rascunho) e o histórico permanece.`;
    if (!confirm(aviso)) return;
    iniciarSalvar(async () => {
      const r = await apagarProdutoAction(produto.id);
      if (!r.ok) {
        setMensagem({ tipo: "erro", texto: r.error });
        return;
      }
      router.push("/produtos");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        <label className="flex flex-col gap-1.5">
          <span className={ROTULO}>Nome do produto</span>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={CAMPO} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={ROTULO}>Descrição</span>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} className={CAMPO} />
        </label>
        <div className="flex flex-wrap gap-6">
          <label className="flex flex-col gap-1.5">
            <span className={ROTULO}>Situação</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className={CAMPO}>
              <option value="draft">Rascunho (não aparece na loja)</option>
              <option value="published">Na loja</option>
            </select>
          </label>
          {categorias.length > 0 && (
            <fieldset className="flex flex-col gap-1.5">
              <legend className={ROTULO}>Categorias</legend>
              <div className="flex flex-wrap gap-3 pt-1">
                {categorias.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={categoriasEscolhidas.includes(c.id)}
                      onChange={(e) =>
                        setCategoriasEscolhidas((l) => (e.target.checked ? [...l, c.id] : l.filter((x) => x !== c.id)))
                      }
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={prevenda} onChange={(e) => setPrevenda(e.target.checked)} />
          Peça em pré-venda
        </label>
        {prevenda && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={ROTULO}>Aviso na página do produto</span>
              <input value={mensagemPrevenda} onChange={(e) => setMensagemPrevenda(e.target.value)} className={CAMPO} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={ROTULO}>Previsão de envio</span>
              <input type="date" value={dataEnvio} onChange={(e) => setDataEnvio(e.target.value)} className={CAMPO} />
            </label>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        <div>
          <h2 className="text-sm font-bold text-ink">Fotos</h2>
          <p className="text-sm text-muted">A primeira é a capa. Use as setas para mudar a ordem.</p>
        </div>
        {imagens.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {imagens.map((url, i) => (
              <li key={`${url}-${i}`} className="flex flex-col gap-2 rounded-md border border-border bg-bg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-[4/5] w-full rounded object-cover" />
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{i === 0 ? "Capa" : `Foto ${i + 1}`}</span>
                  <span className="flex gap-2">
                    <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover para antes" className="disabled:opacity-30">
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(i, 1)}
                      disabled={i === imagens.length - 1}
                      aria-label="Mover para depois"
                      className="disabled:opacity-30"
                    >
                      →
                    </button>
                    <button type="button" onClick={() => setImagens((l) => l.filter((_, idx) => idx !== i))} className="text-danger">
                      Remover
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={arquivoRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            onChange={(e) => enviarArquivos(e.target.files)}
            disabled={enviando}
            className="text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-raised file:px-3 file:py-2 file:text-sm file:text-ink"
          />
          {enviando && <span className="text-sm text-muted">Enviando…</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={linkImagem}
            onChange={(e) => setLinkImagem(e.target.value)}
            placeholder="Ou cole o link de uma imagem"
            className={`${CAMPO} min-w-0 flex-1`}
          />
          <button
            type="button"
            onClick={() => {
              if (!linkImagem.trim()) return;
              setImagens((l) => [...l, linkImagem.trim()]);
              setLinkImagem("");
            }}
            className="rounded-md border border-border px-3 py-2 text-sm text-ink hover:bg-surface-raised"
          >
            Adicionar
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        <div>
          <h2 className="text-sm font-bold text-ink">Variações, preço e estoque</h2>
          <p className="text-sm text-muted">
            Cada linha é uma opção que o cliente compra (ex.: camiseta preta tamanho M). O estoque desce sozinho a cada venda e
            nunca fica negativo.
          </p>
        </div>
        <label className="flex flex-col gap-1.5 sm:max-w-sm">
          <span className={ROTULO}>Opções do produto (separadas por vírgula)</span>
          <input
            value={nomesDasOpcoes}
            onChange={(e) => setNomesDasOpcoes(e.target.value)}
            placeholder="Cor, Tamanho"
            className={CAMPO}
          />
        </label>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted">
                {opcoes.map((o) => (
                  <th key={o} className="px-2 py-2">
                    {o}
                  </th>
                ))}
                <th className="px-2 py-2">Nome (opcional)</th>
                <th className="px-2 py-2">Preço (R$)</th>
                <th className="px-2 py-2">Estoque</th>
                <th className="px-2 py-2">Sob encomenda</th>
                <th className="px-2 py-2">Ativa</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {variacoes.map((v, i) => (
                <tr key={v.id ?? `nova-${i}`} className={`border-b border-border last:border-0 ${v.active ? "" : "opacity-50"}`}>
                  {opcoes.map((o) => (
                    <td key={o} className="px-2 py-2">
                      <input
                        value={v.options[o] ?? ""}
                        onChange={(e) => atualizar(i, { options: { ...v.options, [o]: e.target.value } })}
                        className={`${CAMPO} w-28`}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <input value={v.title} onChange={(e) => atualizar(i, { title: e.target.value })} className={`${CAMPO} w-32`} />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={v.price}
                      onChange={(e) => atualizar(i, { price: e.target.value })}
                      inputMode="decimal"
                      placeholder="0,00"
                      className={`${CAMPO} w-24`}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={v.stock}
                      onChange={(e) => atualizar(i, { stock: e.target.value })}
                      inputMode="numeric"
                      className={`${CAMPO} w-20`}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input type="checkbox" checked={v.allow_backorder} onChange={(e) => atualizar(i, { allow_backorder: e.target.checked })} />
                  </td>
                  <td className="px-2 py-2">
                    <input type="checkbox" checked={v.active} onChange={(e) => atualizar(i, { active: e.target.checked })} />
                  </td>
                  <td className="px-2 py-2 text-right">
                    {!v.id && (
                      <button type="button" onClick={() => setVariacoes((l) => l.filter((_, idx) => idx !== i))} className="text-danger">
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setVariacoes((l) => [...l, variacaoVazia(opcoes)])}
            className="rounded-md border border-border px-3 py-2 text-sm text-ink hover:bg-surface-raised"
          >
            + Adicionar variação
          </button>
          <p className="mt-2 text-xs text-muted">
            Variação que já existe não é apagada (pedidos e etiquetas antigos dependem dela): desmarque “Ativa” para tirá-la
            da loja.
          </p>
        </div>
      </section>

      {mensagem && (
        <p className={`text-sm font-medium ${mensagem.tipo === "ok" ? "text-success" : "text-danger"}`} role="status">
          {mensagem.texto}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={salvar}
          disabled={salvando || enviando}
          className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {salvando ? "Salvando…" : produto ? "Salvar alterações" : "Criar produto"}
        </button>
        {produto && (
          <button type="button" onClick={apagar} disabled={salvando} className="text-sm text-danger hover:underline disabled:opacity-60">
            Apagar produto
          </button>
        )}
      </div>
    </div>
  );
}
