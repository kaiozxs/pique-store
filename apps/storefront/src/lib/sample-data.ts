// Dados de exemplo para conteúdo que ainda não tem módulo no backend
// (Ajuda/FAQ). Produtos, Dicas e Home já vêm de verdade do Medusa — ver lib/medusa.ts.

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
