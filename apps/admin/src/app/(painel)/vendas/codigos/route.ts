import JSZip from "jszip";
import QRCode from "qrcode";
import { getCurrentUser } from "@/lib/auth";
import { podeAcessar } from "@/lib/papel";
import { linkDeVerificacao } from "@/lib/etiquetas";
import { garantirPecas, idPessoal, listVendas, nomeDoCliente } from "@/lib/vendas";

const DATA = /^\d{4}-\d{2}-\d{2}$/;

function csv(valor: string): string {
  return /[;"\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor;
}
function html(valor: string): string {
  return valor.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

/**
 * Pacote para a fábrica: um .zip com, para cada peça vendida no período,
 * o QR, o código da peça, o nome e o ID do cliente.
 *
 *   etiquetas.csv              → planilha (abre no Excel)
 *   folha-para-impressao.html  → todas as etiquetas prontas para imprimir
 *   qr/<CODIGO>.png            → um QR por peça, nomeado pelo código
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !podeAcessar(user.papel, "/vendas")) {
    return new Response("Sem permissão.", { status: 403 });
  }

  const url = new URL(request.url);
  const inicio = url.searchParams.get("start") ?? "";
  const fim = url.searchParams.get("end") ?? "";
  if (!DATA.test(inicio) || !DATA.test(fim)) return new Response("Período inválido.", { status: 400 });

  const vendas = await listVendas(inicio, fim);

  type Linha = { pedido: string; data: string; cliente: string; idCliente: string; peca: string; codigo: string };
  const linhas: Linha[] = [];
  for (const venda of vendas) {
    const pecas = await garantirPecas(venda);
    const nomes = new Map(
      (venda.items ?? []).map((i) => [i.variant_id, `${i.product_title ?? ""}${i.variant_title ? ` — ${i.variant_title}` : ""}`])
    );
    for (const p of pecas) {
      linhas.push({
        pedido: `#${venda.display_id}`,
        data: new Date(venda.created_at).toLocaleDateString("pt-BR"),
        cliente: nomeDoCliente(venda),
        idCliente: venda.customer_id ? idPessoal(venda.customer_id) : "—",
        peca: nomes.get(p.product_variant_id) ?? "Peça PIQUE",
        codigo: p.unique_code,
      });
    }
  }

  const zip = new JSZip();
  const cabecalho = ["Pedido", "Data", "Cliente", "ID do cliente", "Peça", "Código da peça", "Link de verificação"];
  const corpo = linhas.map((l) =>
    [l.pedido, l.data, l.cliente, l.idCliente, l.peca, l.codigo, linkDeVerificacao(l.codigo)].map(csv).join(";")
  );
  // BOM no início: sem ele o Excel abre os acentos quebrados.
  zip.file("etiquetas.csv", "﻿" + [cabecalho.join(";"), ...corpo].join("\r\n"));

  const cards: string[] = [];
  for (const l of linhas) {
    const link = linkDeVerificacao(l.codigo);
    zip.file(`qr/${l.codigo}.png`, await QRCode.toBuffer(link, { width: 600, margin: 2, errorCorrectionLevel: "M" }));
    const svg = await QRCode.toString(link, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
    cards.push(`<div class="tag">
  <div class="qr">${svg}</div>
  <div class="cod">${html(l.codigo)}</div>
  <div class="peca">${html(l.peca)}</div>
  <div class="cli">${html(l.cliente)}<br><span>${html(l.idCliente)} · ${html(l.pedido)}</span></div>
</div>`);
  }
  zip.file(
    "folha-para-impressao.html",
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Etiquetas PIQUE ${inicio} a ${fim}</title>
<style>body{font-family:Arial,sans-serif;margin:20px;color:#000}h1{font-size:16px;margin:0 0 14px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.tag{border:1px solid #bbb;border-radius:6px;padding:10px;text-align:center;break-inside:avoid}
.qr svg{width:120px;height:120px;display:block;margin:0 auto 6px}.cod{font-family:monospace;font-weight:700;font-size:14px}
.peca{font-size:11px;margin-top:3px}.cli{font-size:11px;margin-top:6px;border-top:1px dashed #ccc;padding-top:6px}.cli span{color:#555;font-size:10px}</style>
</head><body><h1>PIQUE · etiquetas de ${inicio.split("-").reverse().join("/")} a ${fim.split("-").reverse().join("/")} · ${linhas.length} peça(s)</h1>
<div class="grid">${cards.join("\n")}</div></body></html>`
  );
  zip.file(
    "LEIA-ME.txt",
    `Etiquetas PIQUE — ${linhas.length} peça(s)\r\n\r\n` +
      `Cada peça tem um código único e um QR. O QR leva à verificação de autenticidade da loja.\r\n` +
      `etiquetas.csv: planilha com pedido, cliente, ID do cliente, peça e código.\r\n` +
      `folha-para-impressao.html: abra no navegador e imprima.\r\n` +
      `qr/: um PNG por peça, com o nome do código — anexe à etiqueta da roupa correspondente.\r\n`
  );

  const conteudo = await zip.generateAsync({ type: "uint8array" });
  return new Response(conteudo as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="etiquetas-pique-${inicio}-a-${fim}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
