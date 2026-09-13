// Dados de exemplo para desenvolvimento da storefront.
// Quando o backend (Medusa) estiver conectado, essas funções são substituídas
// por chamadas reais à Store API — a forma dos dados foi pensada pra já bater
// com o que o painel admin vai controlar (produtos, variantes, disponibilidade,
// pré-venda, dicas, FAQ).

export type Disponibilidade = "DISPONIVEL" | "INDISPONIVEL";

export type ProdutoVariante = {
  cor: string;
  tamanho: string;
  disponibilidade: Disponibilidade;
};

export type Produto = {
  slug: string;
  nome: string;
  categoria: string;
  precoCentavos: number;
  precoPromocionalCentavos?: number;
  badge?: string;
  descricao: string;
  detalhes: string[];
  medidas: { tamanho: string; largura: string; comprimento: string }[];
  variantes: ProdutoVariante[];
  preVenda?: { mensagem: string; prazoEstimado: string };
};

export const PRODUTOS: Produto[] = [
  {
    slug: "moletom-structural",
    nome: "MOLETOM STRUCTURAL",
    categoria: "Moletom",
    precoCentavos: 0,
    badge: "EDIÇÃO LIMITADA",
    descricao:
      "Moletom de peso pesado com corte estruturado, pensado para durar além da estação.",
    detalhes: ["Tecido moletom 100% algodão, peso pesado", "Corte oversized estruturado", "Acabamento premium nas costuras"],
    medidas: [
      { tamanho: "P", largura: "58 cm", comprimento: "68 cm" },
      { tamanho: "M", largura: "61 cm", comprimento: "70 cm" },
      { tamanho: "G", largura: "64 cm", comprimento: "72 cm" },
    ],
    variantes: [
      { cor: "Preto", tamanho: "P", disponibilidade: "DISPONIVEL" },
      { cor: "Preto", tamanho: "M", disponibilidade: "DISPONIVEL" },
      { cor: "Preto", tamanho: "G", disponibilidade: "INDISPONIVEL" },
    ],
  },
  {
    slug: "jaqueta-impulso",
    nome: "JAQUETA IMPULSO",
    categoria: "Jaqueta",
    precoCentavos: 0,
    descricao: "Jaqueta corta-vento com identidade PIQUE, feita para o impulso das ruas.",
    detalhes: ["Tecido corta-vento impermeável", "Forro interno leve", "Zíper metálico premium"],
    medidas: [
      { tamanho: "P", largura: "56 cm", comprimento: "66 cm" },
      { tamanho: "M", largura: "59 cm", comprimento: "68 cm" },
      { tamanho: "G", largura: "62 cm", comprimento: "70 cm" },
    ],
    variantes: [
      { cor: "Preto", tamanho: "M", disponibilidade: "DISPONIVEL" },
      { cor: "Vermelho", tamanho: "M", disponibilidade: "DISPONIVEL" },
    ],
    preVenda: {
      mensagem: "Peça de pré-venda — produção sob demanda.",
      prazoEstimado: "envio em até 30 dias após a compra",
    },
  },
  {
    slug: "camiseta-padrao",
    nome: "CAMISETA PADRÃO",
    categoria: "Camiseta",
    precoCentavos: 0,
    descricao: "Camiseta essencial em algodão pesado, com o mínimo necessário — e nada além disso.",
    detalhes: ["Algodão penteado 220g/m²", "Gola reforçada", "Corte reto"],
    medidas: [
      { tamanho: "P", largura: "50 cm", comprimento: "70 cm" },
      { tamanho: "M", largura: "53 cm", comprimento: "72 cm" },
      { tamanho: "G", largura: "56 cm", comprimento: "74 cm" },
    ],
    variantes: [
      { cor: "Branco", tamanho: "P", disponibilidade: "DISPONIVEL" },
      { cor: "Branco", tamanho: "M", disponibilidade: "DISPONIVEL" },
      { cor: "Preto", tamanho: "M", disponibilidade: "DISPONIVEL" },
    ],
  },
  {
    slug: "calca-incomparavel",
    nome: "CALÇA INCOMPARÁVEL",
    categoria: "Calça",
    precoCentavos: 0,
    descricao: "Calça cargo de corte reto, unindo funcionalidade das ruas e alfaiataria.",
    detalhes: ["Sarja pesada", "Bolsos cargo reforçados", "Cós ajustável"],
    medidas: [
      { tamanho: "38", largura: "40 cm", comprimento: "104 cm" },
      { tamanho: "40", largura: "42 cm", comprimento: "106 cm" },
      { tamanho: "42", largura: "44 cm", comprimento: "108 cm" },
    ],
    variantes: [
      { cor: "Preto", tamanho: "40", disponibilidade: "DISPONIVEL" },
      { cor: "Preto", tamanho: "42", disponibilidade: "INDISPONIVEL" },
    ],
  },
];

export function getProduto(slug: string): Produto | undefined {
  return PRODUTOS.find((p) => p.slug === slug);
}

export type TipPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
};

export const TIPS: TipPost[] = [
  {
    slug: "como-cuidar-do-moletom",
    title: "Como cuidar do seu moletom premium",
    excerpt: "Lavagem, secagem e o que evitar para manter o acabamento por mais tempo.",
    body: "Lave sempre do avesso, em água fria, e evite secadora — o calor alto desgasta o algodão pesado e pode encolher a peça. Prefira secar à sombra, estendido, para manter o caimento estrutural.",
  },
  {
    slug: "guia-de-tamanhos",
    title: "Guia de tamanhos PIQUE",
    excerpt: "Como usar a tabela de medidas para escolher o caimento certo.",
    body: "Todas as peças PIQUE têm corte levemente oversized. Meça uma peça que já veste bem e compare com a tabela de medidas de cada produto antes de escolher o tamanho.",
  },
  {
    slug: "por-tras-do-drop-001",
    title: "Por trás do Drop 001",
    excerpt: "A ideia, os materiais e o processo que viraram a primeira coleção.",
    body: "O Drop 001 nasceu da vontade de provar que streetwear pode ser luxo sem perder a energia da rua. Cada peça passou por múltiplas provas de corte antes de chegar na versão final.",
  },
];

export type FaqItem = { question: string; answer: string };
export type FaqCategory = { title: string; items: FaqItem[] };

export const FAQ: FaqCategory[] = [
  {
    title: "Tamanhos e medidas",
    items: [
      {
        question: "Como escolho o tamanho certo?",
        answer: "Consulte a tabela de medidas na página de cada produto e compare com uma peça que já veste bem.",
      },
    ],
  },
  {
    title: "Pedidos e pagamento",
    items: [
      {
        question: "Quais formas de pagamento são aceitas?",
        answer: "Em breve — o checkout ainda está em desenvolvimento.",
      },
    ],
  },
  {
    title: "Entrega",
    items: [
      {
        question: "Qual o prazo de entrega?",
        answer: "O prazo varia por região e é calculado no checkout. Peças de pré-venda têm prazo estendido, indicado na própria página do produto.",
      },
    ],
  },
  {
    title: "Trocas e devoluções",
    items: [
      {
        question: "Como faço para trocar ou devolver um produto?",
        answer: "Em breve — essa política será publicada aqui pelo painel administrativo da PIQUE.",
      },
    ],
  },
];

export function formatPreco(centavos: number): string {
  if (centavos <= 0) return "[R$ —]";
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
