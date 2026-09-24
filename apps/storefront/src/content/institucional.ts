// Conteúdo das páginas institucionais e legais.
//
// As três políticas abaixo são transcrição dos documentos entregues pela PIQUE
// ("Trocas e Devoluções", "Cancelamentos" e "Pedidos e Acompanhamento", versão
// 1). O texto não foi reescrito: onde algo do documento não entrou, foi por ser
// dirigido a quem constrói o site e não ao cliente, e está anotado no comentário
// da página correspondente.
//
// Os documentos trazem um bloco "Identificação do fornecedor" com razão social,
// CNPJ e endereço marcados como [PREENCHER ANTES DA PUBLICAÇÃO]. Esse bloco não
// foi publicado porque os dados ainda não existem — e não se inventa CNPJ. Assim
// que a PIQUE tiver os dados, eles entram aqui e em /institucional/informacoes-legais.

export type BlocoInstitucional =
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "tabela"; colunas: string[]; linhas: string[][] };

export type SecaoInstitucional = {
  titulo: string;
  blocos: BlocoInstitucional[];
};

export type PaginaInstitucional = {
  title: string;
  intro: string;
  secoes?: SecaoInstitucional[];
  baseLegal?: string;
};

const p = (texto: string): BlocoInstitucional => ({ tipo: "paragrafo", texto });
const ul = (itens: string[]): BlocoInstitucional => ({ tipo: "lista", itens });

export const PAGINAS: Record<string, PaginaInstitucional> = {
  sobre: {
    title: "Sobre a PIQUE",
    intro: "Pra quem tem pique. Pra quem fecha com a PIQUE.",
    // Este texto vinha do bloco de manifesto que ficava na home e foi movido
    // pra cá quando a landing passou a abrir direto na venda. É o texto que
    // já estava no ar, não um texto novo: a história de verdade da marca
    // ainda precisa ser escrita por quem a viveu.
    secoes: [
      {
        titulo: "O propósito",
        blocos: [
          p(
            "A PIQUE nasce da fricção entre a elegância do alfaiate e a energia bruta da rua. Não seguimos o que já existe — impomos o que vem a seguir."
          ),
          p(
            "Cada peça é pensada para durar além da estação, além da tendência, além da comparação. A comparação é irrelevante. O padrão, inegociável."
          ),
        ],
      },
      {
        titulo: "Como a gente trabalha",
        blocos: [
          ul([
            "Cada peça tem um registro individual, que você confere em Verifique seu PIQUE.",
            "Os tamanhos seguem P, M, G e GG, com as medidas no guia de tamanhos.",
            "Quem compra acompanha o pedido pela própria conta, do pagamento à entrega.",
          ]),
        ],
      },
    ],
  },
  "guia-de-tamanhos": {
    title: "Guia de tamanhos",
    intro: "Tabela de medidas de cada peça pra você escolher entre P, M, G e GG sem errar.",
  },

  "trocas-e-devolucoes": {
    title: "Política de Trocas e Devoluções",
    intro:
      "As regras de troca, devolução e arrependimento nas compras feitas na PIQUE. Nenhuma regra desta política pretende restringir direito que seja assegurado por lei.",
    secoes: [
      {
        titulo: "1. Objetivo",
        blocos: [
          p(
            "Esta Política de Trocas e Devoluções estabelece as regras aplicáveis às compras realizadas na PIQUE, incluindo o direito de arrependimento, trocas comerciais, devoluções, situações de vício ou defeito e procedimentos de atendimento. A PIQUE aplica esta política em conjunto com a legislação brasileira de proteção ao consumidor. Nenhuma regra desta política pretende restringir direito que seja assegurado por lei."
          ),
        ],
      },
      {
        titulo: "2. Direito de arrependimento em compras online",
        blocos: [
          p(
            "Nas compras realizadas pela internet, o consumidor poderá exercer o direito de arrependimento no prazo legal de 7 (sete) dias, contado na forma prevista no Código de Defesa do Consumidor. O exercício desse direito não depende de apresentação de justificativa."
          ),
          p(
            "Quando o direito de arrependimento for exercido dentro do prazo legal, a PIQUE observará as regras legais aplicáveis à devolução e à restituição dos valores pagos, inclusive quanto aos custos de entrega e de devolução que a legislação atribuir ao fornecedor."
          ),
          p(
            "A PIQUE disponibilizará meios adequados para que o consumidor solicite o arrependimento, inclusive por meio da mesma ferramenta utilizada para a contratação, sem prejuízo de outros canais de atendimento disponibilizados."
          ),
          p(
            "A abertura da embalagem ou a manipulação necessária para verificar a natureza, as características e as condições do produto não será, por si só, motivo para impedir o exercício do direito de arrependimento, observados os limites legais aplicáveis à conservação do produto e eventuais danos que ultrapassem a verificação razoável."
          ),
        ],
      },
      {
        titulo: "3. Troca comercial por tamanho ou preferência",
        blocos: [
          p(
            "Fora das hipóteses em que a legislação assegure ao consumidor um direito específico de devolução ou substituição, a PIQUE poderá realizar troca comercial de acordo com as condições desta política."
          ),
          p(
            "A PIQUE aceita troca quando o cliente precisar de outro tamanho ou quando, dentro da hipótese comercial cabível, informar que não gostou da peça. A aceitação dependerá do cumprimento das condições aplicáveis e da disponibilidade do produto."
          ),
          p(
            "Quando o cliente tiver escolhido o tamanho errado, os custos de transporte relacionados a uma troca comercial poderão ser de responsabilidade do cliente, desde que essa cobrança não seja aplicável a uma situação em que a legislação determine responsabilidade da PIQUE."
          ),
          p(
            "A PIQUE não substituirá unilateralmente a peça por outro produto, modelo ou tamanho diferente sem concordância do cliente. Quando a substituição do mesmo produto ou espécie não estiver disponível, serão observadas as alternativas e direitos previstos na legislação aplicável."
          ),
        ],
      },
      {
        titulo: "4. Troca ou devolução por vício, defeito ou erro da PIQUE",
        blocos: [
          p(
            "Se a peça apresentar vício ou defeito de responsabilidade da PIQUE, ou se a PIQUE enviar produto ou tamanho diferente daquele adquirido, o caso será tratado pela PIQUE de acordo com a legislação aplicável."
          ),
          p(
            "A PIQUE poderá realizar internamente os procedimentos necessários para avaliar, corrigir ou recuperar a peça quando tecnicamente possível. Essa possibilidade não elimina nem reduz os direitos legais do consumidor."
          ),
          p(
            "Para peças de vestuário, a legislação assegura prazo legal próprio para reclamação de vícios aparentes ou de fácil constatação e estabelece regras específicas para vícios ocultos. Quando um vício não for solucionado dentro do prazo legal aplicável, serão observadas as alternativas previstas no Código de Defesa do Consumidor."
          ),
          p(
            "Quando a responsabilidade for da PIQUE, os custos de transporte necessários à solução do problema serão assumidos pela PIQUE, conforme a legislação aplicável."
          ),
        ],
      },
      {
        titulo: "5. Condições do produto para troca comercial",
        blocos: [
          p(
            "Nas hipóteses de troca comercial voluntária, a peça deve ser devolvida em condições adequadas para nova comercialização, salvo quando se tratar de situação em que a legislação determine tratamento diferente."
          ),
          ul([
            "Apenas experimentada: em princípio, aceita para troca comercial.",
            "Com sinais de uso incompatíveis com simples experimentação: não aceita para troca comercial.",
            "Lavada: não aceita para troca comercial.",
            "Com odor que indique uso: não aceita para troca comercial.",
            "Manchada ou suja: não aceita para troca comercial.",
            "Sem a etiqueta original: não aceita para troca comercial.",
            "Sem a embalagem original: a embalagem original não é exigida, mas a peça deve ser acondicionada em embalagem adequada para o transporte.",
            "Danos causados pelo próprio cliente ou por acondicionamento inadequado: não serão tratados como responsabilidade da PIQUE, ressalvados os direitos que a legislação eventualmente assegure.",
          ]),
          p(
            "As condições acima não serão utilizadas para impedir direito legal de arrependimento ou outro direito obrigatório do consumidor. Em qualquer situação, será considerada a legislação aplicável."
          ),
        ],
      },
      {
        titulo: "6. Frete e custos de devolução",
        blocos: [
          p("A responsabilidade pelos custos de transporte dependerá do motivo da solicitação:"),
          {
            tipo: "tabela",
            colunas: ["Situação", "Responsabilidade"],
            linhas: [
              ["Arrependimento legal de compra online", "PIQUE, conforme a legislação aplicável"],
              ["Vício ou defeito de responsabilidade da PIQUE", "PIQUE"],
              ["Produto/tamanho enviado incorretamente pela PIQUE", "PIQUE"],
              ["Troca comercial porque o cliente escolheu tamanho errado", "Cliente, quando juridicamente permitido"],
            ],
          },
        ],
      },
      {
        titulo: "7. Como solicitar",
        blocos: [
          p("O cliente poderá solicitar troca ou devolução de duas formas:"),
          ul([
            "Pela própria conta: MINHA CONTA → MEUS PEDIDOS → selecionar o pedido → Solicitar troca/devolução.",
            "Pelo atendimento da PIQUE, caso o cliente tenha dificuldade ou precise de orientação.",
          ]),
          p(
            "O atendimento da PIQUE deverá conseguir localizar o pedido e orientar o cliente sobre o procedimento aplicável. A PIQUE confirmará o recebimento da solicitação e dará andamento conforme a legislação e esta política."
          ),
        ],
      },
      {
        titulo: "8. Prazo para envio da peça",
        blocos: [
          p(
            "Depois de orientado pela PIQUE sobre a devolução ou troca, o prazo operacional previsto para o envio da peça pelo cliente é de até 7 (sete) dias corridos, salvo quando prazo diferente for exigido ou assegurado pela legislação ou pela situação concreta."
          ),
        ],
      },
      {
        titulo: "9. Reembolso ou crédito PIQUE",
        blocos: [
          p(
            "Quando a situação permitir a escolha entre restituição e crédito, a PIQUE oferecerá ao cliente as seguintes opções:"
          ),
          ul([
            "Reembolso do valor devido, observadas as regras do meio de pagamento e da legislação aplicável.",
            "Crédito na PIQUE, quando juridicamente cabível e escolhido pelo cliente.",
          ]),
          p(
            "O crédito PIQUE não expira. Ele será tratado como saldo do cliente dentro da PIQUE, e não como cupom promocional."
          ),
          ul([
            "Pode ser utilizado em qualquer produto disponível, inclusive produtos em promoção.",
            "Pode ser somado a créditos de outras compras.",
            "Pode ser combinado com cashback e outros saldos disponíveis.",
            "Se o saldo for menor que o valor da compra, o cliente poderá complementar a diferença com outro meio de pagamento.",
            "Se apenas parte do saldo for utilizada, o restante permanecerá disponível para compras futuras.",
            "O saldo continua vinculado à conta do cliente enquanto houver valor disponível.",
          ]),
          p(
            "Nas hipóteses em que a legislação assegure ao consumidor restituição em dinheiro, o crédito não será imposto como substituição do reembolso."
          ),
        ],
      },
      {
        titulo: "10. Produtos em promoção",
        blocos: [
          p(
            "Produtos adquiridos em promoção seguem as mesmas regras desta Política de Trocas e Devoluções, sem redução dos direitos assegurados pela legislação ao consumidor."
          ),
        ],
      },
      {
        titulo: "11. Produtos personalizados",
        blocos: [
          p(
            "A PIQUE não oferece atualmente produtos personalizados. Os produtos comercializados são aqueles disponibilizados pela própria marca em seus modelos, cores, estampas e tamanhos."
          ),
        ],
      },
      {
        titulo: "12. Atendimento e prazo de resposta",
        blocos: [
          p(
            "As solicitações poderão ser feitas pelos canais disponibilizados pela PIQUE. O atendimento seguirá as regras legais aplicáveis ao comércio eletrônico, inclusive quanto à confirmação do recebimento das demandas e aos prazos de resposta."
          ),
        ],
      },
      {
        titulo: "13. Disposições finais",
        blocos: [
          p(
            "A PIQUE não pretende conceder voluntariamente prazos ou benefícios superiores aos exigidos pela legislação, salvo quando decidir expressamente fazê-lo. Ao mesmo tempo, nenhuma disposição desta política poderá ser interpretada como renúncia, limitação ou redução de direito legal do consumidor."
          ),
          p(
            "Em caso de alteração da legislação aplicável, a PIQUE poderá atualizar esta política para manter suas regras em conformidade com as normas vigentes."
          ),
        ],
      },
    ],
    baseLegal:
      "Lei nº 8.078/1990 (Código de Defesa do Consumidor), especialmente arts. 18, 24, 26 e 49; Decreto nº 7.962/2013, especialmente arts. 4 e 5, referentes ao comércio eletrônico. Esta lista é uma referência normativa e não substitui a análise jurídica do caso concreto.",
  },

  cancelamentos: {
    title: "Política de Cancelamentos",
    intro:
      "Como a PIQUE trata o cancelamento de pedidos antes da entrega, o cancelamento pedido pelo cliente e os casos em que a loja não consegue concluir uma venda.",
    secoes: [
      {
        titulo: "1. Objetivo",
        blocos: [
          p(
            "Esta Política de Cancelamentos estabelece como a PIQUE trata o cancelamento de pedidos antes da entrega, o cancelamento por iniciativa do cliente, situações em que a PIQUE não consegue concluir uma venda e os respectivos encaminhamentos de pagamento e crédito."
          ),
          p(
            "A PIQUE aplica esta política em conjunto com a legislação brasileira de proteção e defesa do consumidor. Nenhuma disposição desta política pretende restringir direito assegurado por lei."
          ),
        ],
      },
      {
        titulo: "2. Pedido ainda não pago",
        blocos: [
          p(
            "Quando o cliente não conclui o pagamento, o pedido permanecerá aguardando a confirmação do pagamento pelo período definido para a forma de pagamento utilizada."
          ),
          p(
            "Para pagamentos via PIX, a tentativa de pagamento expira após 1 (uma) hora sem confirmação. A expiração da tentativa de pagamento não apaga o carrinho: os produtos permanecem no carrinho para que o cliente possa tentar realizar a compra novamente."
          ),
          p(
            "A ausência de pagamento após o prazo de confirmação não gera uma cobrança adicional nem transforma a tentativa expirada em pedido pago."
          ),
        ],
      },
      {
        titulo: "3. Cancelamento solicitado pelo cliente antes do envio",
        blocos: [
          p(
            "O cliente poderá solicitar o cancelamento de um pedido pago enquanto o pedido ainda estiver sob responsabilidade operacional da PIQUE e não tiver sido enviado aos Correios."
          ),
          p(
            "Isso inclui pedidos que ainda estejam em preparação, separação ou embalagem, desde que o pedido permaneça na operação da PIQUE."
          ),
          p(
            "O pedido de cancelamento poderá ser feito pela área de pedidos da conta do cliente ou pelo atendimento da PIQUE."
          ),
        ],
      },
      {
        titulo: "4. Pedido já enviado",
        blocos: [
          p(
            "Após a entrega do pedido à transportadora, não haverá mais cancelamento operacional do envio. A solicitação será tratada pelo procedimento de devolução aplicável ao caso."
          ),
          p(
            "Quando o consumidor estiver exercendo o direito de arrependimento previsto em lei para uma compra realizada fora do estabelecimento comercial, a PIQUE observará integralmente as regras legais aplicáveis, inclusive quanto à devolução dos valores e aos custos de transporte que a legislação atribuir ao fornecedor."
          ),
        ],
      },
      {
        titulo: "5. Quando a PIQUE precisar cancelar um pedido",
        blocos: [
          p(
            "A PIQUE poderá precisar cancelar um pedido em situações como impossibilidade de cumprimento, indisponibilidade superveniente, irregularidade de pagamento, problema operacional ou questão de segurança da transação, sempre respeitando os direitos do consumidor e a legislação aplicável."
          ),
          p(
            "Sempre que houver possibilidade razoável de solução, a PIQUE primeiro tentará resolver o problema e poderá oferecer uma alternativa ou um novo prazo para cumprimento."
          ),
          p(
            "Se o problema não puder ser solucionado, o pedido poderá ser cancelado. Nessa hipótese, serão observadas as alternativas e os direitos previstos na legislação aplicável, inclusive quando o consumidor tiver direito à restituição da quantia paga ou a outras medidas previstas no Código de Defesa do Consumidor."
          ),
        ],
      },
      {
        titulo: "6. Reembolso ou crédito PIQUE",
        blocos: [
          p(
            "Quando a situação permitir que o cliente escolha a forma de restituição, a PIQUE poderá oferecer as seguintes opções: reembolso do valor devido ou crédito na PIQUE."
          ),
          p(
            "O crédito somente será utilizado como alternativa quando juridicamente cabível e por escolha do cliente. Nas situações em que a legislação assegure restituição em dinheiro, a PIQUE realizará a restituição devida."
          ),
          p(
            "O crédito PIQUE não expira e funciona como saldo do cliente dentro da loja. Quando utilizado, poderá ser combinado com outros créditos e cashback, inclusive em produtos promocionais, e o saldo remanescente permanecerá disponível para compras futuras."
          ),
        ],
      },
      {
        titulo: "7. Cancelamento e pagamento",
        blocos: [
          p(
            "Quando um cancelamento exigir estorno ou restituição, a PIQUE adotará as providências necessárias junto ao meio de pagamento utilizado ou por outro meio legalmente adequado, conforme a situação."
          ),
          p(
            "Em compras realizadas com cartão ou outro meio em que a restituição dependa do processamento da instituição financeira, a PIQUE comunicará e encaminhará a solicitação de estorno conforme os procedimentos aplicáveis."
          ),
        ],
      },
      {
        titulo: "8. Como solicitar o cancelamento",
        blocos: [
          p("O cliente poderá solicitar o cancelamento pelos canais disponibilizados pela PIQUE."),
          p(
            "Quando disponível na conta, o fluxo será: MINHA CONTA → MEUS PEDIDOS → selecionar o pedido → solicitar cancelamento."
          ),
          p(
            "O cliente também poderá procurar o atendimento da PIQUE para receber orientação ou solicitar o cancelamento quando a opção não estiver disponível na conta."
          ),
          p(
            "A PIQUE confirmará o recebimento da demanda de cancelamento e dará andamento conforme a legislação e as condições do pedido."
          ),
        ],
      },
      {
        titulo: "9. Cancelamento x devolução",
        blocos: [
          p("Cancelamento e devolução são procedimentos diferentes."),
          p(
            "Enquanto o pedido ainda não foi enviado, a solicitação poderá ser tratada como cancelamento operacional, quando cabível."
          ),
          p(
            "Depois do envio, a situação será tratada pelo procedimento de devolução aplicável, inclusive pelo direito de arrependimento quando estiver dentro do prazo legal."
          ),
        ],
      },
      {
        titulo: "10. Disposições finais",
        blocos: [
          p(
            "A PIQUE não pretende criar prazos voluntários superiores aos exigidos pela legislação quando isso não for necessário. Quando existir prazo ou procedimento legal obrigatório, ele será aplicado conforme a legislação vigente."
          ),
          p(
            "Eventuais situações não previstas expressamente nesta política serão tratadas de acordo com a legislação brasileira aplicável, especialmente o Código de Defesa do Consumidor e as normas que regulamentam o comércio eletrônico."
          ),
          p(
            "Esta política poderá ser atualizada para refletir alterações legais ou operacionais da PIQUE. A versão vigente será disponibilizada no site."
          ),
        ],
      },
      {
        titulo: "Resumo do fluxo",
        blocos: [
          {
            tipo: "tabela",
            colunas: ["Situação", "Tratamento"],
            linhas: [
              ["Não pago / PIX sem confirmação por 1h", "Tentativa expira; carrinho permanece."],
              ["Pago e ainda na PIQUE", "Cancelamento pode ser solicitado."],
              ["Em preparação, ainda na PIQUE", "Cancelamento pode ser solicitado."],
              ["Já enviado aos Correios", "Tratar pelo procedimento de devolução aplicável."],
              [
                "PIQUE não consegue cumprir",
                "Tentar solucionar e oferecer novo prazo; se inviável, cancelar conforme direitos legais.",
              ],
            ],
          },
        ],
      },
    ],
    baseLegal:
      "Lei nº 8.078/1990 (Código de Defesa do Consumidor), especialmente arts. 35, 49 e 51; Decreto nº 7.962/2013, especialmente arts. 4 e 5, sobre comércio eletrônico, atendimento e direito de arrependimento.",
  },

  "pedidos-e-acompanhamento": {
    title: "Política de Pedidos e Acompanhamento",
    intro:
      "Como os pedidos da PIQUE são registrados, acompanhados e atualizados durante a compra, a preparação, o envio e a entrega.",
    secoes: [
      {
        titulo: "1. Objetivo",
        blocos: [
          p(
            "Esta política explica como os pedidos da PIQUE são registrados, acompanhados e atualizados durante o processo de compra, preparação, envio e entrega. O objetivo é permitir que o cliente acompanhe seu pedido de forma simples, visual e clara, sem retirar as demais informações e direitos previstos nas políticas aplicáveis."
          ),
        ],
      },
      {
        titulo: "2. Registro e confirmação do pedido",
        blocos: [
          p(
            "Após a conclusão da contratação, o pedido será registrado na conta do cliente e deverá permanecer disponível em MINHA CONTA > MEUS PEDIDOS. A PIQUE também manterá as informações necessárias para identificação do pedido, pagamento, produtos adquiridos, valores e entrega."
          ),
          p(
            "No comércio eletrônico, a PIQUE observará as obrigações aplicáveis de confirmação do recebimento da contratação e de disponibilização das informações da contratação ao consumidor."
          ),
        ],
      },
      {
        titulo: "3. Status do pedido",
        blocos: [
          p(
            "O sistema manterá os status necessários para representar a situação real do pedido. A interface do cliente, porém, será apresentada de forma resumida e visual, utilizando 4 ícones animados principais. Os ícones e seus textos poderão mudar conforme a situação específica do pedido."
          ),
          {
            tipo: "tabela",
            colunas: ["Etapa", "Exemplo de status exibido", "Função"],
            linhas: [
              ["1. Pedido", "Pedido realizado", "Indicar que o pedido foi criado."],
              ["2. Pagamento", "Pagamento aprovado", "Indicar a confirmação do pagamento."],
              ["3. Preparação", "Em preparação", "Indicar que a PIQUE está preparando o pedido."],
              [
                "4. Transporte",
                "Em movimento",
                "Indicar que o pedido está em deslocamento e mostrar localização disponível.",
              ],
            ],
          },
          p(
            "Os status do sistema não ficam limitados a essas quatro representações. Situações específicas, como cancelamento, devolução ou troca, poderão utilizar ícones, textos e informações diferentes, adequados à situação real do pedido."
          ),
        ],
      },
      {
        titulo: "4. Acompanhamento e localização",
        blocos: [
          p(
            "Quando o pedido estiver em transporte, a PIQUE deverá apresentar, quando a informação estiver disponível, o status de movimentação e a localização correspondente ao último evento de rastreamento."
          ),
          p(
            "A localização não deverá ser estimada ou inventada pela PIQUE. Quando houver integração com o rastreamento dos Correios, serão utilizados os eventos efetivamente disponibilizados pelos Correios para atualizar o acompanhamento do pedido."
          ),
        ],
      },
      {
        titulo: "5. Integração com os Correios",
        blocos: [
          p(
            "A PIQUE utilizará os Correios como transportadora inicial e deverá buscar integração técnica com os serviços de rastreamento disponibilizados pelos Correios para automatizar as atualizações do pedido."
          ),
        ],
      },
      {
        titulo: "6. Movimentação e eventos de entrega",
        blocos: [
          p(
            "O acompanhamento poderá refletir os eventos disponibilizados pelo sistema de rastreamento, como movimentação entre unidades, chegada a uma unidade, saída para entrega e confirmação de entrega."
          ),
          p(
            "Quando houver um novo evento de rastreamento, o sistema poderá atualizar automaticamente o status e a localização mostrados ao cliente."
          ),
        ],
      },
      {
        titulo: "7. Pedido entregue",
        blocos: [
          p(
            "Quando houver confirmação de entrega no rastreamento ou por outro mecanismo válido utilizado pela PIQUE, o pedido poderá ser apresentado como 'Entregue'. A PIQUE manterá o histórico do pedido para consulta na conta do cliente."
          ),
        ],
      },
      {
        titulo: "8. Situações especiais",
        blocos: [
          p(
            "Pedidos que entrem em situações específicas, como pagamento expirado, cancelamento, troca ou devolução, poderão deixar de seguir a apresentação normal das quatro etapas e receber uma representação específica na interface."
          ),
          ul([
            "Cancelamentos: tratados conforme a Política de Cancelamentos.",
            "Trocas e devoluções: tratadas conforme a Política de Trocas e Devoluções.",
            "Falhas ou eventos de transporte: o sistema deverá mostrar o evento disponível no rastreamento e, quando necessário, encaminhar o cliente ao atendimento.",
          ]),
        ],
      },
      {
        titulo: "9. Acesso do cliente",
        blocos: [
          p(
            "O cliente poderá consultar seus pedidos pela área MINHA CONTA > MEUS PEDIDOS. Cada pedido deverá permitir visualizar os principais dados da compra e o acompanhamento correspondente, conforme as informações disponíveis no sistema."
          ),
        ],
      },
      {
        titulo: "10. Transparência e limites do rastreamento",
        blocos: [
          p(
            "A atualização do site depende da disponibilidade das informações de rastreamento recebidas dos serviços integrados. Eventuais intervalos entre eventos, atrasos de atualização ou indisponibilidade do serviço de rastreamento poderão fazer com que a informação exibida no site demore a mudar."
          ),
          p(
            "A PIQUE não deverá criar eventos ou localizações inexistentes para preencher a interface. Quando não houver nova informação disponível, o sistema deverá conservar o último evento válido ou indicar que aguarda atualização."
          ),
        ],
      },
      {
        titulo: "11. Disposições finais",
        blocos: [
          p(
            "Esta política descreve a forma de acompanhamento dos pedidos e complementa as demais políticas da PIQUE. Regras específicas de pagamento, cancelamento, trocas, devoluções, privacidade e entrega serão tratadas nos documentos correspondentes."
          ),
          p(
            "A PIQUE poderá atualizar esta política para refletir alterações de operação, tecnologia ou legislação, preservando os direitos obrigatórios do consumidor."
          ),
        ],
      },
    ],
    baseLegal:
      "Decreto nº 7.962/2013, que regulamenta aspectos do comércio eletrônico, incluindo informações claras, confirmação da contratação, atendimento e execução da oferta.",
  },

  "entrega-e-frete": {
    title: "Entrega e frete",
    intro: "Prazos, valores e como acompanhar seu pedido.",
  },
  criadores: {
    title: "Criadores de conteúdo",
    intro: "Como criar conteúdo com a PIQUE e fazer parte da comunidade.",
  },
  "politica-de-privacidade": {
    title: "Política de privacidade",
    intro: "Quais dados a gente coleta, por que, e o que você pode pedir sobre eles.",
  },
  "termos-de-uso": {
    title: "Termos de uso",
    intro: "As regras de uso do site e das compras feitas por aqui.",
  },
  "politica-de-cookies": {
    title: "Política de cookies",
    intro: "Quais cookies o site usa e pra quê.",
  },
  "politica-de-envio": {
    title: "Política de envio",
    intro: "Como os pedidos são separados, embalados e despachados.",
  },
  "informacoes-legais": {
    title: "Informações legais da empresa",
    intro: "Razão social, CNPJ e endereço da empresa responsável pela loja.",
  },
  "trabalhe-conosco": {
    title: "Trabalhe conosco",
    intro: "Vagas abertas e como mandar seu currículo.",
  },
  "seja-parceiro": {
    title: "Seja parceiro",
    intro: "Parcerias comerciais, colabs e projetos em conjunto.",
  },
  patrocinio: {
    title: "Patrocínio",
    intro: "Propostas de patrocínio de atletas, artistas e eventos.",
  },
  fornecedores: {
    title: "Fornecedores",
    intro: "Como se tornar fornecedor da PIQUE.",
  },
  imprensa: {
    title: "Imprensa",
    intro: "Materiais de imprensa e contato para pauta.",
  },
};
