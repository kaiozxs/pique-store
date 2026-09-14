// Dados de exemplo para conteúdo que ainda não tem módulo no backend
// (Dicas e Ajuda/FAQ). Produtos já vêm de verdade do Medusa — ver lib/medusa.ts.

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
