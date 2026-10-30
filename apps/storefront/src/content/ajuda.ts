import { ancora } from "@/lib/ancora";

// Central de atendimento (/ajuda). Cada artigo aponta para um texto que JÁ existe na
// loja (políticas em content/institucional.ts, ou páginas da conta): nada aqui é
// texto novo sobre prazo, preço ou regra. `secao` é o título exato da seção na
// política; o link cai direto nela (veja ancora()).

export type Artigo = { titulo: string; href: string };
export type CategoriaDeAjuda = {
  id: string;
  nome: string;
  resumo: string;
  icone: "pedido" | "entrega" | "troca" | "cancelamento" | "produto" | "conta";
  artigos: Artigo[];
};

const politica = (slug: string, secao?: string) =>
  `/institucional/${slug}${secao ? `#${ancora(secao)}` : ""}`;

export const CATEGORIAS: CategoriaDeAjuda[] = [
  {
    id: "pedidos",
    nome: "Pedidos e acompanhamento",
    resumo: "Confirmação, status e rastreio do seu pedido",
    icone: "pedido",
    artigos: [
      { titulo: "Veja seus pedidos na sua conta", href: "/conta/pedidos" },
      { titulo: "Como funciona o registro e a confirmação do pedido", href: politica("pedidos-e-acompanhamento", "2. Registro e confirmação do pedido") },
      { titulo: "Entenda os status do seu pedido", href: politica("pedidos-e-acompanhamento", "3. Status do pedido") },
      { titulo: "Acompanhe a localização do pedido", href: politica("pedidos-e-acompanhamento", "4. Acompanhamento e localização") },
      { titulo: "Rastreio com os Correios", href: politica("pedidos-e-acompanhamento", "5. Integração com os Correios") },
    ],
  },
  {
    id: "entregas",
    nome: "Entregas e frete",
    resumo: "Como enviamos e o que fazer quando algo foge do normal",
    icone: "entrega",
    artigos: [
      { titulo: "Entrega e frete", href: politica("entrega-e-frete") },
      { titulo: "Política de envio", href: politica("politica-de-envio") },
      { titulo: "Pedido entregue", href: politica("pedidos-e-acompanhamento", "7. Pedido entregue") },
      { titulo: "Situações especiais na entrega", href: politica("pedidos-e-acompanhamento", "8. Situações especiais") },
    ],
  },
  {
    id: "trocas",
    nome: "Trocas e devoluções",
    resumo: "Arrependimento, tamanho, defeito e como solicitar",
    icone: "troca",
    artigos: [
      { titulo: "Direito de arrependimento em compras online", href: politica("trocas-e-devolucoes", "2. Direito de arrependimento em compras online") },
      { titulo: "Troca por tamanho ou preferência", href: politica("trocas-e-devolucoes", "3. Troca comercial por tamanho ou preferência") },
      { titulo: "Troca ou devolução por defeito ou erro da PIQUE", href: politica("trocas-e-devolucoes", "4. Troca ou devolução por vício, defeito ou erro da PIQUE") },
      { titulo: "Condições do produto para troca", href: politica("trocas-e-devolucoes", "5. Condições do produto para troca comercial") },
      { titulo: "Como solicitar uma troca ou devolução", href: politica("trocas-e-devolucoes", "7. Como solicitar") },
    ],
  },
  {
    id: "cancelamentos",
    nome: "Cancelamentos e reembolsos",
    resumo: "Cancelar um pedido e receber de volta",
    icone: "cancelamento",
    artigos: [
      { titulo: "Pedido ainda não pago", href: politica("cancelamentos", "2. Pedido ainda não pago") },
      { titulo: "Cancelar antes do envio", href: politica("cancelamentos", "3. Cancelamento solicitado pelo cliente antes do envio") },
      { titulo: "Pedido já enviado", href: politica("cancelamentos", "4. Pedido já enviado") },
      { titulo: "Reembolso ou crédito PIQUE", href: politica("cancelamentos", "6. Reembolso ou crédito PIQUE") },
      { titulo: "Como solicitar o cancelamento", href: politica("cancelamentos", "8. Como solicitar o cancelamento") },
    ],
  },
  {
    id: "produtos",
    nome: "Produtos e autenticidade",
    resumo: "Tamanhos e como confirmar que a peça é original",
    icone: "produto",
    artigos: [
      { titulo: "Guia de tamanhos", href: politica("guia-de-tamanhos") },
      { titulo: "Verifique se a sua peça é original", href: "/verifique" },
      { titulo: "Minhas coleções (peças registradas no seu nome)", href: "/conta/colecoes" },
    ],
  },
  {
    id: "conta",
    nome: "Conta e privacidade",
    resumo: "Seus dados, cookies e regras de uso",
    icone: "conta",
    artigos: [
      { titulo: "Minha conta", href: "/conta" },
      { titulo: "Política de privacidade", href: politica("politica-de-privacidade") },
      { titulo: "Política de cookies", href: politica("politica-de-cookies") },
      { titulo: "Termos de uso", href: politica("termos-de-uso") },
    ],
  },
];

/** Os mais procurados, no topo (como os "artigos ninja" da KaBuM!). */
export const MAIS_PROCURADOS: Artigo[] = [
  CATEGORIAS[0]!.artigos[0]!,
  CATEGORIAS[2]!.artigos[0]!,
  CATEGORIAS[3]!.artigos[1]!,
  CATEGORIAS[4]!.artigos[0]!,
];
