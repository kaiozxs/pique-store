# PIQUE — Escopo do Site (visão completa)

> Fonte: reunião com o cliente, documento `PIQUE_Site_Visao_Completa.docx`.
> Rascunho de escopo — define **o que o sistema deve permitir**, não a tecnologia.

## 1. Princípio do projeto

- A PIQUE deve administrar conteúdo e operação sem depender do desenvolvedor para mudanças rotineiras.
- Conteúdo variável deve ser alterável pelo painel: produtos, imagens, textos, destaques, Drop da Semana, WAB, Dicas, promoções e demais módulos.
- Site responsivo (celular e computador).
- Tecnologia é livre — o escopo descreve o resultado esperado.

## 2. Estrutura pública do site

Menu principal: Home · Drop da Semana · WAB · Dicas · Acompanhe seu pedido · Ajuda · Entrar/Perfil · Sacola

## 3. Home

- Hero/abertura visual (imagem, vídeo, texto, botão, identidade visual definidos pela PIQUE).
- Drop da Semana — área dinâmica administrável.
- WAB — área de mistério/em construção, administrável.
- Dicas — destaque de conteúdos publicados.
- Apresentação da PIQUE — institucional/editorial curto e editável.
- Rodapé — redes sociais, contato, ajuda, links institucionais/legais.

## 4. Loja / catálogo

- Listagem de produtos, busca por texto, filtros.
- Produtos em destaque/novos/selecionados pelo painel.
- Estado público de disponibilidade: **apenas** "DISPONÍVEL" / "INDISPONÍVEL" (estoque exato nunca aparece pro cliente).
- Preparado para crescer sem reconstrução do site.

## 5. Página individual do produto

Fotos · nome · preço (+ promocional) · seleção de cor/tamanho · disponibilidade por variante · descrição · detalhes da peça · tabela de medidas · info de pré-venda + prazo estimado · adicionar à sacola/comprar · favoritar.

## 6. WAB

Área própria, pode ficar "em construção"/misteriosa. Editável pelo painel: textos, imagens, vídeos, estado de publicação. Experiência definida depois pela PIQUE.

## 7. Dicas / conteúdo

Criar/editar/publicar/despublicar/excluir. Suporta texto, imagem, vídeo. Evolução futura: conteúdo ligado a canal do YouTube. Organizável para destaque na Home.

## 8. Conta do cliente

Criar conta/entrar · recuperação de senha · perfil · meus pedidos · meus endereços · dados da conta · favoritos.

## 9. Acompanhe seu pedido

Consulta de pedido, status, info de envio. Integração com conta quando fizer sentido; possível consulta por número do pedido.

## 10. Ajuda

FAQ administrável · tamanho/tabela de medidas · pedidos e pagamentos · entrega · trocas e devoluções · contato.

## 11. Sacola e checkout

Adicionar/remover, alterar quantidade, cor/tamanho, subtotal/frete/total. Checkout com dados do cliente, endereço, entrega, pagamento. Pedido atualiza conforme status do pagamento.

## 12. Promoções

Selecionar produto cadastrado → preço promocional → período/ativo-inativo → exibido na página do produto e onde o produto aparecer em destaque.

## 13. Verifique seu PIQUE (autenticidade física)

- Cada unidade física tem um identificador único.
- Cliente informa o identificador em "Verifique seu PIQUE" → sistema confirma autenticidade.
- Peça fica associada ao comprador/titular.
- Transferência de titularidade só com autorização do titular atual.
- Sistema mantém **histórico** de titularidade/transferências.
- Nota fiscal pode compor o cadastro, mas não é a única camada de autenticidade.
- Dados pessoais/nota fiscal não expostos publicamente além do necessário pra verificação.

## 14. Painel administrativo — módulos

| Área | Capacidade |
|---|---|
| Dashboard | Visão resumida de pedidos, vendas, produtos, alertas |
| Produtos | Fotos, nome, descrição, preço, tamanhos, medidas, cores, variantes, estoque, SKU, publicação, destaque |
| Estoque | Quantidade interna por produto/variante → converte em Disponível/Indisponível público |
| Home | Banners, blocos, textos, imagens, produtos em destaque, ordem/visibilidade das seções |
| Drop da Semana | Escolher produtos cadastrados, ordenar, publicar/despublicar |
| Designs/cards | Cards visuais deslizantes ("balões"): imagem, título, descrição, link |
| WAB | Texto, imagem, vídeo, estado de publicação |
| Dicas | Criar/editar/publicar/despublicar/organizar (texto, foto, vídeo) |
| Promoções | Preço promocional, período/status sobre produto existente |
| Pedidos | Ver pedido/produto/cliente/pagamento/endereço, atualizar status/envio |
| Clientes | Consultar contas, pedidos, dados operacionais |
| Mídia | Upload/organização de fotos, vídeos, banners, arquivos |
| Ajuda/FAQ | Editar perguntas/respostas/orientações |
| Verifique seu PIQUE | Cadastrar unidades, identificadores, titularidade, fluxo de transferência autorizada |
| Menu/navegação | Ajustes estruturais simples sem exigir código |
| Configurações | Contato, redes sociais, institucional, links gerais |
| Administradores | Controle de acesso admin, múltiplos usuários no futuro |

## 15. Busca, filtros e favoritos

Busca global · filtros de catálogo preparados para crescer · favoritos vinculados à conta.

## 16. Pré-venda

Marcar produto como pré-venda · período e texto · prazo estimado ao cliente · pedido registrado como pré-venda no painel · PIQUE administra a comunicação do prazo.

## 17. Integrações e camada técnica

Pagamento/checkout funcionais · frete (cálculo/registro) · e-mails transacionais (pedido recebido, pagamento, envio, etc.) · preparação p/ integração futura com YouTube · analytics opcional (não obrigatório na v1) · backup e segurança na arquitetura.

## 18. Propriedade e autonomia

O site é da PIQUE. O desenvolvedor entrega estrutura e funcionamento; a PIQUE administra produtos, conteúdo, aparência configurável e operação pelo painel.

---

## Decisões técnicas (2026-09-13)

- **Base de e-commerce:** [Medusa.js](https://medusajs.com) (Node/TypeScript, open-source) — cobre produtos/variantes/estoque/pedidos/promoções/clientes via API.
- **Pagamento:** a decidir depois — checkout funciona ponta a ponta usando o provider nativo `pp_system_default` do Medusa (sem gateway real ainda); trocar de provider é a única mudança quando o cliente decidir.
- **Banco de dados:** Postgres gerenciado via [Supabase](https://supabase.com) (conta/projeto do cliente) — evita depender de Docker local; a connection string entra em `apps/backend/.env` (nunca commitada).
- **Estrutura:**
  - `apps/backend` — projeto Medusa (API + módulos customizados da PIQUE). O admin nativo do Medusa (`/app`) continua sendo usado só para cadastro de produto/variante/estoque/cliente/desconto.
  - `apps/storefront` — loja pública (Next.js, com a identidade visual definida em `design/`) — Home, catálogo, produto, dicas, ajuda, WAB, verificação de autenticidade, **carrinho, checkout (endereço, frete, pagamento) e conta do cliente (registro/login, endereços, histórico de pedidos)** já implementados com dados reais, ponta a ponta. Falta: recuperação de senha, favoritos persistidos e consulta de pedido sem login (seção 9 do escopo).
  - `apps/admin` — **painel administrativo separado** (Next.js próprio, porta 3001), pedido explicitamente pelo cliente em vez de usar só o admin nativo do Medusa. Autentica como usuário admin do Medusa (login server-side, token guardado em cookie httpOnly — o navegador nunca fala direto com a API do Medusa). Cobre: dashboard de vendas, lista/detalhe de pedidos (com espaço reservado pra emissão de NF, ainda pausada até o cliente definir CNPJ/certificado/provedor), e os 6 módulos de conteúdo customizados (WAB, Drop da Semana, Home Configurável, Dicas, FAQ, Verifique seu PIQUE) — que por isso saíram do admin nativo do Medusa, pra não ter duas telas fazendo a mesma coisa.
- **Módulos customizados a construir sobre o Medusa** (não vêm prontos): Drop da Semana, WAB, Dicas, blocos configuráveis da Home, Pré-venda, FAQ, e **Verifique seu PIQUE** (autenticidade/titularidade de peça física). Todos implementados — ver `docs/modelagem-dados.md`.
