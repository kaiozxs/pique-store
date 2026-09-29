# Changelog — PIQUE

Registro do que mudou na loja, do mais recente para o mais antigo. Escrito pra
ser lido por quem não programa: cada entrada diz o que mudou na prática.

Endereços: a loja em `pique-store-seven.vercel.app`, o servidor no Railway e o
painel administrativo como aplicação separada.

---

## 28 de setembro

**Área da conta completa.** Minha Conta deixou de ser uma página só e virou um
conjunto: dados pessoais (agora editáveis), pedidos, favoritos, endereços,
Verifique seu PIQUE e Minhas Coleções. O menu do perfil, que tinha apenas
"Minha conta" e "Sair", passou a listar tudo.

- **Meus Pedidos** ganhou página própria com filtros: todos, em processamento,
  enviados e concluídos.
- **Favoritos** agora pertencem à conta. Antes o coração sumia ao fechar a aba.
- **Endereços** ganharam editar e definir padrão. Excluir passou a pedir
  confirmação, e excluir o endereço padrão exige escolher qual assume o lugar.
- **Minhas Coleções** é nova: as peças registradas no nome da pessoa, cada uma
  com código, status e caminho para transferir.

**Rastreamento ilustrado.** A linha do tempo do pedido ganhou os símbolos de
sempre — recibo, cartão, caixa, caminhão (avião quando aéreo) e casa na
entrega. A etapa atual se mexe, as concluídas param, e três pontos pulsam
indicando o caminho para a próxima.

**Código de rastreio no painel.** A operação cola o código do despacho e ele
aparece na conta do cliente com link para os Correios — sem depender da
integração automática, que ainda não existe.

**Imagens que sumiam no navegador de apps.** Quem abria a loja pelo navegador
embutido do app do Google via a página inicial sem as fotos das coleções. O
efeito de entrada dependia de um sinal que nunca chega nesse tipo de navegador.
Agora são três mecanismos independentes, e o último garante que nada fica
escondido.

**Celular mais responsivo ao toque.** Botões e cards afundam de leve quando
tocados, os alvos dos ícones do cabeçalho passaram para o mínimo confortável de
44 pixels, e o menu entra deslizando em vez de estalar na tela.

**Avisos de preenchimento errado.** CEP inexistente falhava em silêncio; agora
avisa. E o CPF passou a ser conferido de verdade — antes bastava ter 11
números, então `111.111.111-11` era aceito.

**Sensação de carregamento.** As páginas levam de 0,4 a 1,2 segundo e não havia
nenhum sinal disso: a tela ficava parada e de repente trocava. Entraram
esqueletos por rota, que aparecem no instante do clique, e uma transição curta
de chegada.

**Logo horizontal no rodapé.** O cabeçalho manteve a empilhada.

---

## 25 de setembro

**Bordas das fotos dissolvem no fundo.** As imagens terminavam numa linha reta
e a emenda com o preto aparecia, principalmente no topo, encostando no
cabeçalho.

---

## 24 de setembro

**Página inicial reestruturada.** Passou a abrir na venda: abertura → peças em
destaque → coleções → WAB. O bloco de manifesto saiu da home e virou o conteúdo
da página Sobre a PIQUE. As peças em destaque viraram uma vitrine horizontal.

**Escala em telas de notebook.** Num 1366×768 a capa ocupava 92% da tela e a
pessoa não via que a página continuava. O tamanho do título olhava só a largura
da janela e ignorava a altura. Hoje ocupa 63%.

**Poppins no texto corrido.** Anton continua nos títulos de impacto.

**Fotos dos produtos.** Deixaram de ter as mangas cortadas, o card ficou
quadrado (mesmo formato das fotos) e ganhou fundo cinza — a camiseta preta
sumia contra o fundo escuro.

**Efeitos.** O botão da abertura ganhou preenchimento diagonal, os cards saltam
quando o mouse passa, e o login ganhou o mesmo tratamento, com abas animadas e
o caminho de recuperar senha.

**Cabeçalho do catálogo compacto**, para as peças aparecerem sem rolar.

---

## 23 de setembro

**Detalhe do pedido.** Página nova com a linha do tempo de quatro etapas,
itens, valores, endereço e rastreio. Dois erros apareceram no teste e foram
corrigidos: o subtotal vinha somado ao frete, e o tamanho aparecia como "S" em
vez de "P".

**Rodapé redesenhado** com a faixa de newsletter, redes e as bandeiras de
pagamento.

**Sacola.** Sai junto ao encerrar a sessão — antes as escolhas de uma pessoa
ficavam visíveis para a próxima que usasse o aparelho. E passou a durar
enquanto o navegador estiver aberto.

**Quantidade trava no estoque.** Antes dava para pedir 3 peças havendo 1.

**Parcelamento em até 12x** declarado no código, e status do pedido em
português — o cliente via `not_fulfilled`.

---

## 22 de setembro

**Políticas publicadas**: trocas e devoluções, cancelamentos, e pedidos e
acompanhamento, em páginas próprias. O bloco de identificação da empresa ficou
de fora porque CNPJ, razão social e endereço ainda não existem.

**Banner novo** na abertura e a seção WAB com a foto do modelo, em largura
cheia.

**Seções surgem conforme a página rola.**

**Bandeiras de pagamento** desenhadas em preto e branco.

---

## 17 de setembro

**Segurança.** Cabeçalhos de proteção e política de conteúdo no site.

**CPF e data de nascimento** no checkout, telefone obrigatório, tamanhos em
P/M/G/GG.

**Desempenho.** Mais cache no conteúdo editorial para reduzir idas ao servidor.

**Rodapé institucional** com contato, e a seção BOOK renomeada para WAB.

---

## 16 de setembro

**Mercado Pago.** Provedor de pagamento próprio e o Payment Brick no checkout.

**Login com Google**, conta obrigatória antes do pagamento e cálculo de frete
na página do produto.

**Menus rápidos no cabeçalho**: busca, conta e sacola.

---

## 15 de setembro

**Menu de celular.** A navegação inteira estava invisível no telefone.

**Falha de segurança corrigida** no link da abertura, que aceitava endereço
malicioso vindo do painel.

---

## 14 de setembro

**Carrinho, checkout e conta do cliente** — o ciclo de compra completo.

**Painel administrativo separado**, com dashboard e pedidos, e os seis módulos
de conteúdo migrados para ele.

**Módulos de conteúdo**: Verifique seu PIQUE (autenticidade e titularidade das
peças), Drop da Semana, Home configurável, Dicas, FAQ e pré-venda.

**Fotos reais dos produtos**, carrossel 360° na página da peça, mega-menu de
categorias e a seção de coleções.

**Preenchimento de endereço pelo CEP.**

---

## 13 de setembro

**Início do projeto.** Estrutura da loja, páginas públicas (catálogo, produto,
dicas, ajuda, WAB, pedido e verificação), servidor Medusa conectado ao banco, e
a loja falando com a API real.

---

## O que ainda não está pronto

Registrado aqui para não se perder:

- **E-mail**: a loja não envia nenhum, nem a confirmação de pedido. Trava
  também recuperação de senha, verificação em duas etapas, "avise-me quando
  voltar" e lembrete de carrinho abandonado.
- **Pix**: anunciado no rodapé, mas ainda não habilitado no Mercado Pago.
- **Dados da empresa**: CNPJ, razão social e endereço são exigência legal e
  ainda não constam no site.
- **Crédito PIQUE**: depende das regras de saldo.
- **Rastreio automático dos Correios**: depende de contrato. Por ora o código é
  digitado no painel.
- **Login com Google**: o código está pronto e testado; falta autorizar o
  endereço de retorno no console do Google.
